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

  try {
    const response = await axios.get(process.env.SUBSCRIPTION_URL, {
      params: { name },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    return { statusCode: 1, message: "Licensing Server is Down...!!!" };
  }
}
