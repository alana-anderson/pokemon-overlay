"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsComponent = ({ cardData }) => {
  if (!cardData) return null;

  const marketPrice = cardData?.tcgplayer?.prices?.holofoil?.market ?? cardData?.tcgplayer?.prices?.normal?.market ?? 'N/A';
  const averageSellPrice = cardData?.cardmarket?.prices?.averageSellPrice ?? 0;
  const avg30Price = cardData?.cardmarket?.prices?.avg30 ?? 0;

  const calculateTrendPercentage = (currentPrice, previousPrice) => {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1);
  };

  const marketPriceTrend = calculateTrendPercentage(marketPrice, avg30Price);
  const avgSellPriceTrend = calculateTrendPercentage(averageSellPrice, avg30Price);

  const checkSetRotationStatus = (releaseDate) => {
    const rotationDate = new Date(new Date().getFullYear(), 8, 1); // September 1st of current year
    const setDate = new Date(releaseDate);
    const twoYearsAgo = new Date(rotationDate.getFullYear() - 2, rotationDate.getMonth(), rotationDate.getDate());
    
    if (setDate < twoYearsAgo) {
      return "Rotated out";
    } else if (setDate < rotationDate && setDate >= twoYearsAgo) {
      return "Rotating soon";
    } else {
      return "In standard format";
    }
  };

  const rotationStatus = checkSetRotationStatus(cardData.set.releaseDate);

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-800 text-zinc-100">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-zinc-100">Card Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Market Price</span>
            <div className="flex items-center">
              <span className="font-bold mr-2 text-zinc-100">${marketPrice}</span>
              <span className={`text-sm ${marketPriceTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketPriceTrend > 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                {Math.abs(marketPriceTrend)}%
              </span>
            </div>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Avg Sell Price</span>
            <div className="flex items-center">
              <span className="font-bold mr-2 text-zinc-100">${averageSellPrice.toFixed(2)}</span>
              <span className={`text-sm ${avgSellPriceTrend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {avgSellPriceTrend > 0 ? <TrendingUp className="inline h-4 w-4" /> : <TrendingDown className="inline h-4 w-4" />}
                {Math.abs(avgSellPriceTrend)}%
              </span>
            </div>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-zinc-400">Rotation Status</span>
            <span className="font-bold text-zinc-100">{rotationStatus}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DividerPage() {
  // This is a placeholder for the actual card data
  // In a real application, you would fetch this data or pass it as a prop
  const mockCardData = {
    tcgplayer: {
      prices: {
        holofoil: { market: 100 },
      },
    },
    cardmarket: {
      prices: {
        averageSellPrice: 95,
        avg30: 90,
      },
    },
    set: {
      releaseDate: "2022-05-01",
    },
  };

  return (
    <div className="container mx-auto p-4 bg-black text-zinc-100">
      <h1 className="text-2xl font-bold mb-4 text-zinc-100">Divider Page</h1>
      <StatsComponent cardData={mockCardData} />
    </div>
  );
}
