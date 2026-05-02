import { getBalance } from "@/lib/getBalance";

export async function GET() {
  try {
    const balance = await getBalance();

    return Response.json({
      success: true,
      balance,
    });
  } catch (error) {
    console.log("BALANCE API ERROR:", error);

    return Response.json(
      {
        success: false,
        balance: 0,
        error: "Failed to calculate balance",
      },
      { status: 500 }
    );
  }
}
