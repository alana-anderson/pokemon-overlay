"use client";

import upcomingSets from "@/app/data/sets";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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
function checkUpcomingSetImpact(cardName, upcomingSets, cardData) {
  const marketPrice = cardData.tcgplayer.prices.holofoil.market || cardData.tcgplayer.prices.normal.market;
  const matchingSet = upcomingSets.find(set =>
    set.relatedPokemon.some(pokemon => cardName.includes(pokemon))
  );

  if (matchingSet) {
    const impactPercentage = calculateImpact(matchingSet.impact);
    const predictedImpact = (marketPrice * impactPercentage) / 100;
    const salePrice = marketPrice + predictedImpact;

    return {
      predictedImpact: matchingSet.predictedImpact,
      salePrice: salePrice.toFixed(2)
    };
  }

  return {
    predictedImpact: "No upcoming impact predicted.",
    salePrice: marketPrice.toFixed(2),
    marketTrend: calculateMarketTrend(cardData),
    rarity: cardData.rarity,
    setRotationStatus: checkSetRotationStatus(cardData.set.releaseDate),
    popularityIndex: calculatePopularityIndex(cardData)
  };
}

function calculateMarketTrend(cardData) {
  const recentPrices = [cardData.cardmarket.prices.avg7, cardData.cardmarket.prices.avg30];
  const currentPrice = cardData.tcgplayer.prices.holofoil.market || cardData.tcgplayer.prices.normal.market;
  
  if (currentPrice > recentPrices[0] && recentPrices[0] > recentPrices[1]) {
    return "Upward trend";
  } else if (currentPrice < recentPrices[0] && recentPrices[0] < recentPrices[1]) {
    return "Downward trend";
  } else {
    return "Stable";
  }
}

function checkSetRotationStatus(releaseDate) {
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
}

function calculatePopularityIndex(cardData) {
  // This would be a more complex function based on your data sources
  // For now, we'll use a placeholder calculation
  const priceRatio = cardData.tcgplayer.prices.holofoil.market / cardData.tcgplayer.prices.holofoil.low;
  return (priceRatio * 10).toFixed(1) + " / 10";
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

  // Use the updated checkUpcomingSetImpact function
  const result = checkUpcomingSetImpact(cardData.name, upcomingSets, cardData);
  const { predictedImpact, salePrice: initialSalePrice } = result;
  const salePrice = averageSellPrice > marketPrice ? (averageSellPrice * 1.1).toFixed(2) : initialSalePrice;

  // Updated chart data - positioning 30-day, 7-day, and current price as specified.
  const chartData = [
    { name: '30 Days Ago', marketPrice: cardData?.cardmarket?.prices?.avg30 ?? 0 },
    { name: '7 Days Ago', marketPrice: cardData?.cardmarket?.prices?.avg7 ?? 0 },
    { name: 'Current Price', marketPrice: parseFloat(marketPrice) },
  ];

  const chartConfig = {
    marketPrice: {
      label: "Market Price",
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="md:col-span-1">
          <img src={cardData.images.large} alt={cardData.name} className="w-full rounded-lg shadow-lg" />
          <div className="mt-4 space-y-2">
            <Badge variant="secondary" className="text-sm">NM+</Badge>
            <p className="text-sm text-muted-foreground">{cardData.set.name}</p>
          </div>
        </div>

        {/* Middle column - intentionally left blank for spacing */}
        <div className="hidden md:block"></div>

        {/* Right column */}
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {cardData.name}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salePrice}</div>
          </CardContent>
          <CardContent>
            <div className="grid gap-3">
              <dl className="grid gap-3">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Rarity</dt>
                  <dd>{cardData.rarity}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Market Price</dt>
                  <dd className="flex items-center">
                    ${marketPrice}
                    {typeof cardData?.cardmarket?.prices?.avg30 === 'number' && (
                      <span className="ml-2 text-sm">
                        {marketPrice > cardData.cardmarket.prices.avg30 ? (
                          <TrendingUp className="inline h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Avg Sell Price</dt>
                  <dd className="flex items-center">
                    ${averageSellPrice.toFixed(2)}
                    {typeof cardData?.cardmarket?.prices?.avg30 === 'number' && (
                      <span className="ml-2 text-sm">
                        {averageSellPrice > cardData.cardmarket.prices.avg30 ? (
                          <TrendingUp className="inline h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="inline h-4 w-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </dd>
                </div>
                {!result.marketTrend ? null : (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Market Trend</dt>
                    <dd>{result.marketTrend}</dd>
                  </div>
                )}
                {!result.rarity ? null : (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Rarity</dt>
                    <dd>{result.rarity}</dd>
                  </div>
                )}
                {!result.setRotationStatus ? null : (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Set Rotation Status</dt>
                    <dd>{result.setRotationStatus}</dd>
                  </div>
                )}
                {!result.popularityIndex ? null : (
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Popularity Index</dt>
                    <dd>{result.popularityIndex}</dd>
                  </div>
                )}
              </dl>
            </div>
            <Separator className="my-4" />
            <div>
              <h4 className="text-lg font-medium mb-2">Upcoming Set Impact</h4>
              <p className="text-muted-foreground">{predictedImpact}</p>
            </div>
            <br></br>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line 
                    type="monotone" 
                    dataKey="marketPrice" 
                    stroke={chartConfig.marketPrice.color} 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border p-2 rounded shadow">
                            <p className="font-semibold">{payload[0].payload.name}</p>
                            <p>${payload[0].value.toFixed(2)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row border-t p-4">
            <div className="flex w-full items-center gap-2">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Market Price</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  <span className="text-sm font-normal text-muted-foreground">
                    {marketPrice > cardData.cardmarket.prices.avg30 ? (
                      <TrendingUp className="inline h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="inline h-4 w-4 text-red-500" />
                    )}
                  </span>
                  {typeof cardData?.cardmarket?.prices?.avg30 === 'number' && (
                    <span>
                        {((marketPrice - cardData.cardmarket.prices.avg30) / cardData.cardmarket.prices.avg30 * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-xs text-muted-foreground">Avg Sell Price</div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  <span className="text-sm font-normal text-muted-foreground">
                    {averageSellPrice > cardData.cardmarket.prices.avg30 ? (
                      <TrendingUp className="inline h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="inline h-4 w-4 text-red-500" />
                    )}
                  </span>
                  {typeof cardData?.cardmarket?.prices?.avg30 === 'number' && (
                    <span>
                      {((averageSellPrice - cardData.cardmarket.prices.avg30) / cardData.cardmarket.prices.avg30 * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
