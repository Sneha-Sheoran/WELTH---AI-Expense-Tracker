"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { subDays } from "date-fns";

// Categories with their typical amount ranges
const CATEGORIES = {
  INCOME: [
    { name: "salary", range: [5000, 8000] },
    { name: "freelance", range: [1000, 3000] },
    { name: "investments", range: [500, 2000] },
    { name: "other-income", range: [100, 1000] },
  ],
  EXPENSE: [
    { name: "housing", range: [1000, 2000] },
    { name: "transportation", range: [100, 500] },
    { name: "groceries", range: [200, 600] },
    { name: "utilities", range: [100, 300] },
    { name: "entertainment", range: [50, 200] },
    { name: "food", range: [50, 150] },
    { name: "shopping", range: [100, 500] },
    { name: "healthcare", range: [100, 1000] },
    { name: "education", range: [200, 1000] },
    { name: "travel", range: [500, 2000] },
  ],
};

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  return Number((Math.random() * (max - min) + min).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category =
    categories[Math.floor(Math.random() * categories.length)];

  return {
    category: category.name,
    amount: getRandomAmount(category.range[0], category.range[1]),
  };
}

export async function seedTransactions() {
  try {
    // Get logged-in Clerk user
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized");
    }

    // Find corresponding database user
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Find one account belonging to the user
    const account = await db.account.findFirst({
      where: {
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("No account found");
    }

    const transactions = [];
    let totalBalance = 0;

    // Generate last 90 days of transactions
    for (let i = 90; i >= 0; i--) {
      const date = subDays(new Date(), i);

      const transactionsPerDay =
        Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < transactionsPerDay; j++) {
        const type = Math.random() < 0.4 ? "INCOME" : "EXPENSE";

        const { category, amount } = getRandomCategory(type);

        transactions.push({
          id: crypto.randomUUID(),
          type,
          amount,
          description:
            type === "INCOME"
              ? `Received {category}`
              : `Paid for {category}`,
          date,
          category,
          status: "COMPLETED",
          userId: user.id,
          accountId: account.id,
          createdAt: date,
          updatedAt: date,
        });

        totalBalance += type === "INCOME"
          ? amount
          : -amount;
      }
    }

    await db.$transaction(async (tx) => {
      // Delete previous transactions
      await tx.transaction.deleteMany({
        where: {
          accountId: account.id,
        },
      });

      // Insert new transactions
      await tx.transaction.createMany({
        data: transactions,
      });

      // Update account balance
      await tx.account.update({
        where: {
          id: account.id,
        },
        data: {
          balance: totalBalance,
        },
      });
    });

    return {
      success: true,
      message: `${transactions.length} transactions created successfully.`,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: error.message,
    };
  }
}