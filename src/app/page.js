"use client";

import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const router = useRouter();

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const queryWords = searchQuery.toLowerCase().split(' ');
      const formattedQuery = queryWords.map((word, index) => {
        if (word.includes(':')) {
          return word;
        } else if (index === 0) {
          return `name:"*${word}*"`;
        } else if (['common', 'uncommon', 'rare', 'holofoil', 'rainbow', 'secret'].includes(word)) {
          return `rarity:"*${word}*"`;
        } else {
          return `(name:"*${word}*" OR set.name:"*${word}*")`;
        }
      }).join(' ');

      console.log('Formatted query:', formattedQuery);

      const response = await axios.get('https://api.pokemontcg.io/v2/cards', {
        params: { q: formattedQuery },
        headers: {
          'X-Api-Key': process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY
        }
      });
      setCards(response.data.data);
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError(error.response?.data?.error?.message || 'An error occurred while fetching cards');
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const SkeletonCard = () => (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="p-2">
        <Skeleton className="h-4 w-3/4 bg-zinc-800" />
        <Skeleton className="h-3 w-1/2 bg-zinc-800 mt-1" />
      </CardHeader>
      <CardContent className="p-2">
        <Skeleton className="w-full aspect-[2.5/3.5] bg-zinc-800" />
        <Skeleton className="h-3 w-full bg-zinc-800 mt-2" />
        <Skeleton className="h-3 w-3/4 bg-zinc-800 mt-1" />
      </CardContent>
    </Card>
  );

  const CardComponent = ({ card }) => (
    <Card 
      key={card.id} 
      className="bg-zinc-900 border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800"
      onClick={() => router.push(`/divider/${card.id}`)}
    >
      <CardHeader className="p-2">
        <CardTitle className="text-zinc-100 text-sm truncate">{card.name}</CardTitle>
        <p className="text-zinc-400 text-xs">{card.set.name}</p>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative w-full aspect-[2.5/3.5]">
          <Image
            src={card.images.small}
            alt={card.name}
            layout="fill"
            objectFit="contain"
            className="rounded-sm"
          />
        </div>
        <p className="text-zinc-400 text-xs mt-1">Rarity: {card.rarity}</p>
        {card.tcgplayer && card.tcgplayer.prices && (
          <div className="mt-1">
            <h3 className="font-bold text-zinc-300 text-xs">Market Prices:</h3>
            {Object.entries(card.tcgplayer.prices).map(([priceType, priceData]) => (
              <p key={priceType} className="text-zinc-400 text-xs flex justify-between items-center">
                <span>{priceType}:</span>
                <span>
                  ${priceData.market?.toFixed(2) || 'N/A'}
                  {priceData.market && priceData.marketFoil && (
                    <span className="ml-1">
                      {priceData.market < priceData.marketFoil ? (
                        <TrendingUp className="inline h-3 w-3 text-green-500" />
                      ) : (
                        <TrendingDown className="inline h-3 w-3 text-red-500" />
                      )}
                    </span>
                  )}
                </span>
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-4 bg-zinc-950 text-zinc-100">
      <h1 className="text-2xl font-bold mb-4 text-zinc-100">Pokédex Lookup</h1>
      <div className="flex mb-4">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search cards (e.g., Pikachu Holon, Charizard rare rainbow)"
          className="mr-2 bg-zinc-900 text-zinc-100 border-zinc-700"
        />
        <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7 gap-4">
        {loading ? (
          Array(14).fill().map((_, index) => <SkeletonCard key={index} />)
        ) : !hasSearched ? (
          <div className="col-span-full text-center text-zinc-400 py-8">
            Search Pokémon cards to get started
          </div>
        ) : cards.length === 0 ? (
          <div className="col-span-full text-center text-zinc-400 py-8">
            No results found
          </div>
        ) : (
          cards.map((card) => <CardComponent key={card.id} card={card} />)
        )}
      </div>
    </div>
  );
}
