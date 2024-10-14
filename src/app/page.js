"use client";

import upcomingSets from "@/app/data/sets";

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";

// Helper function to calculate mean from a percentage range
function calculateImpact(impactRange) {
  const [min, max] = impactRange.replace('%', '').split('-').map(Number);
  if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
    throw new Error('Invalid impact range format. Expected a valid percentage range.');
  }
  return (min + max) / 2; // Use mean for simplicity
}

// Function to check upcoming set impact and calculate sale price
function checkUpcomingSetImpact(cardName, upcomingSets, marketPrice) {
  const matchingSet = upcomingSets.find(set => 
    set.relatedPokemon.some(pokemon => cardName.includes(pokemon))
  );

  if (matchingSet) {
    const impactPercentage = calculateImpact(matchingSet.impact); // Get mean impact
    const predictedImpact = (marketPrice * impactPercentage) / 100; // Apply impact to market price
    const salePrice = marketPrice + predictedImpact; // Recommended sale price

    return {
      predictedImpact: matchingSet.predictedImpact,
      salePrice: salePrice.toFixed(2)
    };
  }

  return {
    predictedImpact: "No upcoming impact predicted.",
    salePrice: marketPrice.toFixed(2)
  };
}

export default function Home() {
  const [cardData, setCardData] = useState(null);
  const cardId = 'ex13-104'; // Gold Star Pika as example

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY
          }
        });
        if (response.data?.data) {
          setCardData(response.data.data);
        } else {
          console.error('No card data found for the given ID.');
          setCardData(null);
        }
      } catch (error) {
        console.error('Error fetching card data', error);
        setCardData(null);
      }
    };

    fetchCardData();
  }, []);

  if (!cardData) {
    return <div>Loading...</div>;
  }

  // Extract market price from card data
  const marketPrice = cardData?.tcgplayer?.prices?.holofoil?.market ?? cardData?.tcgplayer?.prices?.normal?.market ?? 'N/A';
  const averageSellPrice = cardData?.cardmarket?.prices?.averageSellPrice ?? 0;
  if (marketPrice === "N/A") {
    return <div>Market price not available</div>;
  }

  // Use the upcoming set impact function to calculate sale price and impact prediction
  const { predictedImpact, salePrice: initialSalePrice } = checkUpcomingSetImpact(cardData.name, upcomingSets, marketPrice);
  const salePrice = averageSellPrice > marketPrice ? (averageSellPrice * 1.1).toFixed(2) : initialSalePrice;

  // Updated chart data - positioning 30-day, 7-day, and current price as specified.
  const chartData = [
    { name: '30 Days Ago', marketPrice: cardData?.cardmarket?.prices?.avg30 ?? 0 },
    { name: '7 Days Ago', marketPrice: cardData?.cardmarket?.prices?.avg7 ?? 0 },
    { name: 'Current Price', marketPrice: marketPrice },
  ];

  const chartConfig = {
    marketPrice: {
      label: "Market Price",
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-950 text-white">
      {/* Display card data */}
      <Card className="w-[400px] bg-gray-800 shadow-lg text-white">
        <CardHeader>
          <CardTitle>{cardData.name}</CardTitle>
          <CardDescription>
            <Badge variant="outline">${salePrice}</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img src={cardData.images.large} alt={cardData.name} className="w-full mb-4" />
          <p>Rarity: {cardData.rarity}</p>
          <p>Market Price: ${marketPrice}</p>
          <p>Average Sell Price: ${averageSellPrice}</p>
          <p>Sale Price: ${salePrice}</p>

          {/* Predictive Analysis Section */}
          <div className="mt-4">
            <h4 className="text-lg font-medium">Upcoming Set Impact</h4>
            <p>{predictedImpact}</p>
          </div>
        </CardContent>

        {/* Line Chart with Padding and Dots */}
        <div className="mt-4">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              >
                <Tooltip
                  content={<ChartTooltipContent hideLabel className='bg-gray-800 text-white' />}
                  cursor={false}
                />
                <Line
                  type="monotone"
                  dataKey="marketPrice"
                  stroke='white'
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </Card>
    </div>
  );
}
