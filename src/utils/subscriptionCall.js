import axios from "axios";

export async function getSubscriptionDetails(name) {
  if (!process.env.SUBSCRIPTION_URL) {
    return { statusCode: 1, message: "Licensing URL is not configured." };
  }

  if (!name) {
    return {
      statusCode: 1,
      message: "Company name is required for licensing lookup.",
    };
  }

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await axios.get(process.env.SUBSCRIPTION_URL, {
        params: { name },
      });

      return response.data;
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        // Wait 1.5 seconds before retrying to handle intermittent DNS/network drops
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }
  }

  console.log("Subscription check failed after 3 attempts:");
  console.log(lastError);
  return { statusCode: 1, message: "Licensing Server is Down...!!!" };
}
