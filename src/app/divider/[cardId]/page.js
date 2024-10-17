"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsComponent = ({ cardData }) => {
  if (!cardData) return null;

  const marketPrice = cardData?.tcgplayer?.prices?.holofoil?.market ?? cardData?.tcgplayer?.prices?.normal?.market ?? 'N/A';
  const averageSellPrice = cardData?.cardmarket?.prices?.averageSellPrice ?? 0;
  const avg30Price = cardData?.cardmarket?.prices?.avg30 ?? 0;

  const calculateTrendPercentage = (currentPrice, previousPrice) => {
    if (previousPrice === 0) return 0;
    return ((currentPrice - previousPrice) / previousPrice * 100).toFixed(2);
  };

  const marketPriceTrend = calculateTrendPercentage(marketPrice, avg30Price);
  const avgSellPriceTrend = calculateTrendPercentage(averageSellPrice, avg30Price);

  const StatItem = ({ label, value, trend }) => (
    <div className="flex flex-col">
      <h3 className="text-sm font-medium text-zinc-400 mb-1">{label}</h3>
      <div className="flex items-baseline">
        <p className="text-2xl font-semibold text-zinc-100">{value}</p>
        {trend !== null && (
          <Badge variant={trend > 0 ? "success" : "destructive"} className="ml-2 text-xs">
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
        <div className="grid grid-cols-5 gap-4 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-zinc-100">{cardData.name}</h2>
            <p className="text-sm text-zinc-400">{cardData.set.name}</p>
          </div>
          <StatItem 
            label="Market Price" 
            value={`$${typeof marketPrice === 'number' ? marketPrice.toFixed(2) : marketPrice}`}
            trend={marketPriceTrend}
          />
          <div className="flex items-center justify-center">
            <img
              src={cardData.images.small}
              alt={cardData.name}
              className="rounded-lg object-contain w-24 h-32"
            />
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
