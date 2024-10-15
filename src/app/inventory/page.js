"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { X } from 'lucide-react';

// Updated inventory with 'available' property
const inventory = [
  { id: 'ex13-104', name: 'Gold Star Pikachu', available: true },
  { id: 'base1-4', name: 'Charizard', available: false },
  { id: 'base1-2', name: 'Blastoise', available: true },
  { id: 'base1-1', name: 'Bulbasaur', available: true },
  { id: 'base1-3', name: 'Venusaur', available: false },
  { id: 'base1-5', name: 'Charmander', available: true },
  { id: 'base1-6', name: 'Charmeleon', available: true },
  { id: 'base1-7', name: 'Charizard', available: false },
  { id: 'base1-8', name: 'Squirtle', available: true },
  { id: 'base1-9', name: 'Wartortle', available: true },
  { id: 'base1-10', name: 'Blastoise', available: false },
  { id: 'base1-11', name: 'Caterpie', available: true },
  { id: 'base1-12', name: 'Metapod', available: true },
  { id: 'base1-13', name: 'Butterfree', available: false },
  { id: 'base1-14', name: 'Weedle', available: true },
  { id: 'base1-15', name: 'Kakuna', available: true },
  { id: 'base1-16', name: 'Beedrill', available: false },
  { id: 'base1-17', name: 'Pidgey', available: true },
  { id: 'base1-18', name: 'Pidgeotto', available: true },
  { id: 'base1-19', name: 'Pidgeot', available: false },
  // Add more cards as needed
];

export default function Inventory() {
  const [cardImages, setCardImages] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const fetchCardImages = async () => {
      const images = {};
      for (const card of inventory) {
        try {
          const response = await axios.get(`https://api.pokemontcg.io/v2/cards/${card.id}`, {
            headers: {
              'X-Api-Key': process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY
            }
          });
          if (response.data?.data?.images?.small) {
            images[card.id] = response.data.data.images.small;
          }
        } catch (error) {
          console.error(`Error fetching image for card ${card.id}:`, error);
        }
      }
      setCardImages(images);
    };

    fetchCardImages();
  }, []);

  const handleKeyDown = useCallback((event) => {
    const { key } = event;
    const gridCols = 4; // Adjust this based on your grid layout

    switch (key) {
      case 'ArrowRight':
        setSelectedIndex((prev) => Math.min(prev + 1, inventory.length - 1));
        break;
      case 'ArrowLeft':
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'ArrowDown':
        setSelectedIndex((prev) => Math.min(prev + gridCols, inventory.length - 1));
        break;
      case 'ArrowUp':
        setSelectedIndex((prev) => Math.max(prev - gridCols, 0));
        break;
      case 'Enter':
        const selectedCard = inventory[selectedIndex];
        console.log(`You selected ${selectedCard.name}`);
        break;
      default:
        break;
    }
  }, [selectedIndex]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="container mx-auto p-2">
      <br></br>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
        {inventory.map((card, index) => (
          <Card 
            key={card.id} 
            className={`cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors ${index === selectedIndex ? 'ring-2 ring-primary' : ''}`}
          >
            <CardContent className="p-2">
              <div className="relative w-full aspect-[2/3]">
                {cardImages[card.id] ? (
                  <>
                    <img
                      src={cardImages[card.id]}
                      alt={card.name}
                      className={`w-full h-full object-cover rounded-md shadow-md ${!card.available ? 'brightness-50' : ''}`}
                    />
                    {!card.available && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <X className="text-white w-12 h-12" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
                    <span className="text-gray-400 text-xs">Loading...</span>
                  </div>
                )}
              </div>
              <p className="mt-1 text-center text-xs font-medium text-gray-300 truncate">{card.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
