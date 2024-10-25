"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart2, DollarSign } from "lucide-react";
import upcomingSets from "@/app/data/sets";
import Image from 'next/image';

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

  const result = checkUpcomingSetImpact(cardData.name, upcomingSets, cardData);
  const { predictedImpact, salePrice: initialSalePrice } = result;
  const salePrice = typeof marketPrice === 'number' && averageSellPrice > marketPrice 
    ? Math.round(averageSellPrice * 1.1)
    : initialSalePrice !== 'N/A' ? Math.round(parseFloat(initialSalePrice)) : 'N/A';

  const calculateTrendPercentage = (currentPrice, previousPrice) => {
    if (previousPrice === 0) return 0;
    return Math.round((currentPrice - previousPrice) / previousPrice * 100);
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

  const StatItem = ({ label, value, trend, isMarketPrice = false }) => (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-gray-300 mb-1">{label}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-white">
          {value.startsWith('$') ? (
            <>
              <DollarSign className="h-4 w-4 text-muted-foreground inline mr-1" />
              {isMarketPrice ? 
                Math.floor(parseFloat(value.substring(1))) : 
                Math.round(parseFloat(value.substring(1)))}
            </>
          ) : value}
        </p>
        {trend !== null && (
          <Badge variant="outline" className="ml-2 text-xs border-zinc-700 text-gray-300">
            {trend > 0 ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
            {Math.abs(trend)}%
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="p-[1px] rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 via-pink-500 via-red-500 via-yellow-500 via-green-500 to-blue-500"
      style={{
        backgroundSize: '200% 200%',
        animation: 'rainbow-animation 6s linear infinite',
      }}
    >
      <Card className="w-full bg-zinc-900 shadow-lg border-none relative overflow-hidden rounded-lg">
        <div
          className="absolute inset-0 z-0"
          style={{ backgroundImage: `url(${cardData.images.large})`, backgroundSize: 'cover', backgroundPosition: 'center 15%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-pink-500/30 z-10" />
        <div className="absolute inset-0 bg-zinc-900/70 backdrop-blur-sm z-20" />
        <CardContent className="p-6 relative z-30">
          <div className="grid grid-cols-6 gap-4 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl font-bold text-white">{cardData.name}</h2>
              <p className="text-sm text-gray-300">{cardData.set.name}</p>
            </div>
            <StatItem 
              label="Market Price" 
              value={`$${typeof marketPrice === 'number' ? marketPrice : marketPrice}`}
              trend={marketPriceTrend}
              isMarketPrice={true}
            />
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-300 mb-1">Demand Index</h3>
              <div className="flex items-center">
                <BarChart2 className="h-6 w-6 mr-2 text-blue-500" />
                <span className="text-2xl font-semibold text-white">{demandIndex}</span>
              </div>
            </div>
            <StatItem 
              label="Avg. Sell Price" 
              value={`$${Math.round(averageSellPrice)}`}
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
        <div className="absolute top-4 right-4 w-16 h-auto z-40">
          <Image 
            src={cardData.images.small} 
            alt={cardData.name} 
            width={128}
            height={179}
            className="rounded-sm shadow-md"
          />
        </div>
      </Card>
    </div>
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
    return <div className="container mx-auto p-4 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-black min-h-screen">
      <StatsComponent cardData={cardData} />
      <style jsx>{`
        @keyframes rainbow-animation {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
}
