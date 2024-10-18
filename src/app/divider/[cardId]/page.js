"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import upcomingSets from "@/app/data/sets";

// Add these functions outside of the component
function calculateImpact(impactRange) {
  const [min, max] = impactRange.replace('%', '').split('-').map(Number);
  if (isNaN(min) || isNaN(max) || min < 0 || max < 0) {
    throw new Error('Invalid impact range format. Expected a valid percentage range.');
  }
  return (min + max) / 2; // Use mean for simplicity
}

function checkUpcomingSetImpact(cardName, upcomingSets, cardData) {
  const marketPrice = cardData?.tcgplayer?.prices?.holofoil?.market || 
                      cardData?.tcgplayer?.prices?.normal?.market || 
                      cardData?.tcgplayer?.prices?.reverseHolofoil?.market ||
                      cardData?.tcgplayer?.prices?.firstEditionHolofoil?.market;

  if (!marketPrice) {
    return {
      predictedImpact: "Unable to determine impact due to missing price data.",
      salePrice: "N/A"
    };
  }

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
  };
}

const StatsComponent = ({ cardData }) => {
  if (!cardData) return null;

  const marketPrice = cardData?.tcgplayer?.prices?.holofoil?.market || 
                      cardData?.tcgplayer?.prices?.normal?.market || 
                      cardData?.tcgplayer?.prices?.reverseHolofoil?.market ||
                      cardData?.tcgplayer?.prices?.firstEditionHolofoil?.market ||
                      'N/A';
  const averageSellPrice = cardData?.cardmarket?.prices?.averageSellPrice ?? 0;
  const avg30Price = cardData?.cardmarket?.prices?.avg30 ?? 0;

  // Calculate sale price using checkUpcomingSetImpact
  const result = checkUpcomingSetImpact(cardData.name, upcomingSets, cardData);
  const { predictedImpact, salePrice: initialSalePrice } = result;
  const salePrice = typeof marketPrice === 'number' && averageSellPrice > marketPrice 
    ? (averageSellPrice * 1.1).toFixed(2) 
    : initialSalePrice;

  const calculateTrendPercentage = (currentPrice, previousPrice) => {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
  };

  const marketPriceTrend = calculateTrendPercentage(marketPrice, avg30Price);
  const avgSellPriceTrend = calculateTrendPercentage(averageSellPrice, avg30Price);

  const calculateDemandIndex = (marketPrice, averageSellPrice) => {
    if (marketPrice === 'N/A' || averageSellPrice === 0) return 'N/A';
    const ratio = marketPrice / averageSellPrice;
    if (ratio > 1.1) return 'High';
    if (ratio < 0.9) return 'Low';
    return 'Medium';
  };

  const demandIndex = calculateDemandIndex(marketPrice, averageSellPrice);

  const StatItem = ({ label, value, trend }) => (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-zinc-400 mb-1">{label}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-zinc-100">{value}</p>
        {trend !== null && (
          <Badge variant="outline" className="ml-2 text-xs border-zinc-700 text-zinc-400">
            {trend > 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <Card className="w-full bg-zinc-900 shadow-lg border-zinc-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-6 gap-4 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-zinc-100">{cardData.name}</h2>
            <p className="text-sm text-zinc-400">{cardData.set.name}</p>
          </div>
          <StatItem 
            label="Market Price" 
            value={`$${typeof marketPrice === 'number' ? marketPrice.toFixed(2) : marketPrice}`}
            trend={marketPriceTrend}
          />
          <div className="flex flex-col">
            <h3 className="text-sm font-medium text-zinc-400 mb-1">Demand Index</h3>
            <div className="flex items-center">
              <BarChart2 className="h-6 w-6 mr-2 text-blue-500" />
              <span className="text-2xl font-semibold text-zinc-100">{demandIndex}</span>
            </div>
          </div>
          <StatItem 
            label="Avg. Sell Price" 
            value={`$${averageSellPrice.toFixed(2)}`}
            trend={avgSellPriceTrend}
          />
          <StatItem 
            label="Rotation Status" 
            value={checkSetRotationStatus(cardData.set.releaseDate)}
            trend={null}
          />
          <StatItem 
            label="Sale Price" 
            value={salePrice === 'N/A' ? 'N/A' : `$${salePrice}`}
            trend={null}
          />
        </div>
      </CardContent>
    </Card>
  );
};

function checkSetRotationStatus(releaseDate) {
  const rotationDate = new Date(new Date().getFullYear(), 8, 1); // September 1st of current year
  const setDate = new Date(releaseDate);
  const twoYearsAgo = new Date(rotationDate.getFullYear() - 2, rotationDate.getMonth(), rotationDate.getDate());
  
  if (setDate < twoYearsAgo) {
    return "Rotated out";
  } else if (setDate < rotationDate && setDate >= twoYearsAgo) {
    return "Rotating soon";
  } else {
    return "In standard";
  }
}

export default function DividerPage() {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const cardId = params.cardId;

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${cardId}`, {
          headers: {
            'X-Api-Key': process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY
          }
        });
        if (response.data?.data) {
          setCardData(response.data.data);
        } else {
          setError('No card data found for the given ID.');
        }
      } catch (error) {
        console.error('Error fetching card data', error);
        setError('Error fetching card data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      fetchCardData();
    }
  }, [cardId]);

  if (loading) {
    return <div className="container mx-auto p-4 text-zinc-100">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-black min-h-screen">
      <StatsComponent cardData={cardData} />
    </div>
  );
}
