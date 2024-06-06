import { Document, Model } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLastYearAnalytics<T extends Document>(
  model: Model<T>
): Promise<{ data: MonthData[] }> {
  const data: MonthData[] = [];
  const now = new Date();
  now.setDate(now.getDate() + 1);
  for (let i = 0; i < 12; i++) {
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - i * 28
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28
    );

    const monthYear = startDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    const count = await model.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    data.push({ month: monthYear, count });
  }
  return { data };
}
