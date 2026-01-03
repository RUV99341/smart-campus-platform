/* eslint-disable */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {VertexAI} = require("@google-cloud/vertexai");
const {ImageAnnotatorClient} = require("@google-cloud/vision");

admin.initializeApp();

const firestore = admin.firestore();
const vision = new ImageAnnotatorClient();

// Initialize Vertex AI
const vertex_ai = new VertexAI({
  project: process.env.GCLOUD_PROJECT,
  location: "us-central1",
});
const generativeModel = vertex_ai.getGenerativeModel({
  model: "gemini-1.0-pro-vision-001",
});

/**
 * Moderates a complaint for inappropriate content using AI.
 *
 * @param {object} data The data passed to the function.
 * @param {string} data.title The title of the complaint.
 * @param {string} data.description The description of the complaint.
 * @param {string|null} data.imageUrl The URL of the image associated with the complaint.
 * @param {object} context The context of the function call.
 * @param {object} context.auth The authenticated user's information.
 * @returns {Promise<object>} A promise that resolves with the result of the moderation.
 */
exports.moderateComplaint = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "You must be logged in to submit a complaint.",
    );
  }

  const {title, description, imageUrl} = data;
  const {uid} = context.auth;

  if (!title || !description) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "The function must be called with a title and description.",
    );
  }

  try {
    // 1. Moderate Text using Gemini
    const textPrompt = `
      You are the moderation AI for the Smart Campus Platform. Your task is to determine if a new student-submitted complaint is appropriate for the platform.

      A complaint is INAPPROPRIATE if it contains any of the following:
      - Profanity, hate speech, or harassment
      - Explicit or violent content
      - Spam, advertisements, or irrelevant information
      - Personal attacks or bullying
      - Anything that violates a university's code of conduct

      A complaint is APPROPRIATE if it is a legitimate issue, such as:
      - "The Wi-Fi in the library is not working."
      - "There is a broken window in the science building."
      - "The water fountain on the 2nd floor is leaking."

      Analyze the following complaint:
      Title: "${title}"
      Description: "${description}"

      Respond with only a single word: "APPROPRIATE" or "INAPPROPRIATE".
    `;

    const textResult = await generativeModel.generateContent(textPrompt);
    const textModerationResponse =
      textResult.response.candidates[0].content.parts[0].text.trim();

    if (textModerationResponse.includes("INAPPROPRIATE")) {
      return {
        status: "rejected",
        message: "This complaint was rejected for inappropriate text content.",
      };
    }

    // 2. Moderate Image if it exists
    if (imageUrl) {
      const [imageResult] = await vision.safeSearchDetection(imageUrl);
      const safeSearch = imageResult.safeSearchAnnotation;

      const isUnsafe = [
        safeSearch.adult,
        safeSearch.spoof,
        safeSearch.medical,
        safeSearch.violence,
        safeSearch.racy,
      ].some((level) => ["LIKELY", "VERY_LIKELY"].includes(level));

      if (isUnsafe) {
        return {
          status: "rejected",
          message: "This complaint was rejected for an inappropriate image.",
        };
      }
    }

    // 3. If all checks pass, save to Firestore
    await firestore.collection("complaints").add({
      title,
      description,
      imageUrl,
      userId: uid,
      status: "pending", // Or "approved" if no manual review is needed
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {status: "success", message: "Complaint submitted successfully."};
  } catch (error) {
    console.error("Error moderating complaint:", error);
    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred while processing your complaint.",
      error.message,
    );
  }
});
