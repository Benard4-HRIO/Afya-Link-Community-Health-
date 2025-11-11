// server/controllers/chatController.js
const responses = [
  "I'm here for you. Can you tell me a bit more about what’s been on your mind?",
  "It’s okay to feel overwhelmed sometimes. What usually helps you calm down?",
  "Remember, you’re not alone. Many people feel like this and find ways to get better.",
  "That sounds tough. Have you had a chance to talk to someone about it before?",
  "Taking care of your mental health is important. What do you usually do to relax?"
];

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ reply: "Please type a message first." });
    }

    // Count messages per session (simple in-memory limit)
    if (!global.messageCount) global.messageCount = 0;
    global.messageCount++;

    // Stop after 5 messages
    if (global.messageCount > 5) {
      return res.json({
        reply:
          "You've reached the chat limit for now. Our mental health team will reach out to assist you soon. 💙"
      });
    }

    // Random response selection
    const botReply = responses[Math.floor(Math.random() * responses.length)];

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Chatbot Error:', error);
    res.status(500).json({ reply: "Something went wrong. Please try again later." });
  }
};
