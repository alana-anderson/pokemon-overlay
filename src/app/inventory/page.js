"use client";

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card";
import { Check, MoreHorizontal, X, Layers2, Layers3 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Marquee from '@/components/ui/marquee'; // Ensure this path is correct

const inventory = [
  // Vintage Era (1st Generation)
  { id: 'base1-4', name: 'Charizard', available: true, condition: 'LP', era: 'Vintage' },
  { id: 'base1-2', name: 'Blastoise', available: true, condition: 'MP', era: 'Vintage' },
  { id: 'base1-15', name: 'Venusaur', available: false, condition: 'HP', era: 'Vintage' },
  { id: 'fossil-1', name: 'Aerodactyl', available: true, condition: 'NM', era: 'Vintage' },
  { id: 'jungle-1', name: 'Clefable', available: false, condition: 'MP', era: 'Vintage' },
  { id: 'base2-4', name: 'Mewtwo', available: true, condition: 'LP', era: 'Vintage' },
  { id: 'gym1-2', name: 'Blaine\'s Charizard', available: true, condition: 'NM', era: 'Vintage' },
  { id: 'gym2-14', name: 'Rocket\'s Mewtwo', available: false, condition: 'HP', era: 'Vintage' },
  { id: 'neo1-8', name: 'Lugia', available: true, condition: 'MP', era: 'Vintage' },
  { id: 'neo2-17', name: 'Shining Gyarados', available: false, condition: 'LP', era: 'Vintage' },

  // Mid Era (3rd-5th Generation)
  { id: 'ex1-95', name: 'Rayquaza ex', available: true, condition: 'NM', era: 'Mid' },
  { id: 'ex13-104', name: 'Gold Star Pikachu', available: true, condition: 'NM', era: 'Mid' },
  { id: 'dp1-130', name: 'Dialga LV.X', available: false, condition: 'LP', era: 'Mid' },
  { id: 'pl4-122', name: 'Arceus LV.X', available: true, condition: 'MP', era: 'Mid' },
  { id: 'hgss1-123', name: 'Lugia LEGEND', available: false, condition: 'NM', era: 'Mid' },
  { id: 'col1-1', name: 'Kyogre & Groudon LEGEND', available: true, condition: 'LP', era: 'Mid' },
  { id: 'bw1-114', name: 'Reshiram Full Art', available: true, condition: 'NM', era: 'Mid' },
  { id: 'bw5-138', name: 'Bianca Full Art', available: false, condition: 'MP', era: 'Mid' },
  { id: 'xy1-146', name: 'Yveltal EX Full Art', available: true, condition: 'NM', era: 'Mid' },
  { id: 'xy6-119', name: 'M Rayquaza EX Full Art', available: false, condition: 'LP', era: 'Mid' },

  // Modern Era (6th Generation onwards)
  { id: 'sm1-152', name: 'Lillie Full Art', available: true, condition: 'NM', era: 'Modern' },
  { id: 'sm8-226', name: 'Cynthia Full Art', available: false, condition: 'NM', era: 'Modern' },
  { id: 'sm12-247', name: 'Reshiram & Charizard GX Rainbow', available: true, condition: 'NM', era: 'Modern' },
  { id: 'swsh1-202', name: 'Zacian V Full Art', available: true, condition: 'NM', era: 'Modern' },
  { id: 'swsh3-193', name: 'Eternatus VMAX Rainbow', available: false, condition: 'LP', era: 'Modern' },
  { id: 'swsh5-188', name: 'Pikachu VMAX Rainbow', available: true, condition: 'NM', era: 'Modern' },
  { id: 'swsh7-198', name: 'Umbreon VMAX Alternate Art', available: false, condition: 'NM', era: 'Modern' },
  { id: 'swsh9-154', name: 'Charizard V Alternate Art', available: true, condition: 'NM', era: 'Modern' },
  { id: 'swsh11-172', name: 'Giratina VSTAR Rainbow', available: true, condition: 'NM', era: 'Modern' },
  { id: 'swsh12-186', name: 'Lugia VSTAR Rainbow', available: false, condition: 'LP', era: 'Modern' },
];

// Add this component to render the badge
const ConditionBadge = ({ condition }) => (
  <Badge className="absolute top-2 right-2" variant="secondary" size="sm">
    {condition}
  </Badge>
);

const CardActions = ({ card, queue, onAddToStack, onMarkSold }) => {
  const [open, setOpen] = useState(false);
  const isInStack = queue.some(user => user.stack.includes(card.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isInStack ? <Layers3 className="h-4 w-4" /> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Select action..." />
          <CommandList>
            <CommandEmpty>No action found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem
                onSelect={() => {
                  onMarkSold(card.id);
                  setOpen(false);
                }}
              >
                Mark as sold
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Add to stack">
              {queue.map((user) => (
                <CommandItem
                  key={user.username}
                  onSelect={() => {
                    onAddToStack(card.id, user.username);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${
                      user.stack.includes(card.id) ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                  {user.username}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function Inventory() {
  const [cardImages, setCardImages] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [queue, setQueue] = useState([]);
  const [inventoryState, setInventoryState] = useState(inventory);

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

  // Add this function to update the queue
  const updateQueue = (newUser) => {
    setQueue(prevQueue => {
      const updatedQueue = [...prevQueue, newUser];
      return updatedQueue.sort((a, b) => a.priority - b.priority);
    });
  };

  const handleMarkSold = (cardId) => {
    setInventoryState(prev => prev.map(card => 
      card.id === cardId ? { ...card, available: false } : card
    ));
  };

  const handleAddToStack = (cardId, username) => {
    setQueue(prev => prev.map(user => 
      user.username === username
        ? { ...user, stack: user.stack.includes(cardId) 
            ? user.stack.filter(id => id !== cardId) 
            : [...user.stack, cardId] }
        : user
    ));
  };

  const isCardInStack = (cardId) => {
    return queue.some(user => user.stack.includes(cardId));
  };

  return (
    <div className="container mx-auto p-2">
      {/* First Row of Marquee */}
      <Marquee className="mb-4" pauseOnHover style={{ '--duration': '130s' }}>
        <div className="flex space-x-4">
          {inventoryState.map((card) => (
            <Card 
              key={card.id} 
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors group w-48"
            >
              <CardContent className="p-2 relative">
                <div className="relative w-full aspect-[2/3]">
                  {cardImages[card.id] ? (
                    <>
                      <Image
                        src={cardImages[card.id]}
                        alt={card.name}
                        layout="fill"
                        className={`rounded-md shadow-md ${!card.available ? 'brightness-50' : ''}`}
                      />
                      {!card.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="text-white w-12 h-12" />
                        </div>
                      )}
                      {isCardInStack(card.id) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers3 className="text-white w-12 h-12" />
                        </div>
                      )}
                      {card.available && !isCardInStack(card.id) && <ConditionBadge condition={card.condition} />}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
                      <span className="text-gray-400 text-xs">Loading...</span>
                    </div>
                  )}
                </div>
                <CardActions 
                  card={card}
                  queue={queue}
                  onAddToStack={handleAddToStack}
                  onMarkSold={handleMarkSold}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </Marquee>

      {/* Second Row of Marquee */}
      <Marquee className="mb-4" pauseOnHover style={{ '--duration': '130s' }} reverse>
        <div className="flex space-x-4">
          {inventoryState.map((card) => (
            <Card 
              key={card.id} 
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors group w-48"
            >
              <CardContent className="p-2 relative">
                <div className="relative w-full aspect-[2/3]">
                  {cardImages[card.id] ? (
                    <>
                      <Image
                        src={cardImages[card.id]}
                        alt={card.name}
                        layout="fill"
                        className={`rounded-md shadow-md ${!card.available ? 'brightness-50' : ''}`}
                      />
                      {!card.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="text-white w-12 h-12" />
                        </div>
                      )}
                      {isCardInStack(card.id) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers3 className="text-white w-12 h-12" />
                        </div>
                      )}
                      {card.available && !isCardInStack(card.id) && <ConditionBadge condition={card.condition} />}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
                      <span className="text-gray-400 text-xs">Loading...</span>
                    </div>
                  )}
                </div>
                <CardActions 
                  card={card}
                  queue={queue}
                  onAddToStack={handleAddToStack}
                  onMarkSold={handleMarkSold}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </Marquee>

      {/* Third Row of Marquee */}
      <Marquee className="mb-4" pauseOnHover style={{ '--duration': '130s' }}>
        <div className="flex space-x-4">
          {inventoryState.map((card) => (
            <Card 
              key={card.id} 
              className="cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors group w-48"
            >
              <CardContent className="p-2 relative">
                <div className="relative w-full aspect-[2/3]">
                  {cardImages[card.id] ? (
                    <>
                      <Image
                        src={cardImages[card.id]}
                        alt={card.name}
                        layout="fill"
                        className={`rounded-md shadow-md ${!card.available ? 'brightness-50' : ''}`}
                      />
                      {!card.available && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <X className="text-white w-12 h-12" />
                        </div>
                      )}
                      {isCardInStack(card.id) && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Layers3 className="text-white w-12 h-12" />
                        </div>
                      )}
                      {card.available && !isCardInStack(card.id) && <ConditionBadge condition={card.condition} />}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center rounded-md">
                      <span className="text-gray-400 text-xs">Loading...</span>
                    </div>
                  )}
                </div>
                <CardActions 
                  card={card}
                  queue={queue}
                  onAddToStack={handleAddToStack}
                  onMarkSold={handleMarkSold}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </Marquee>

      <div className="mt-8 flex">
        <div className="w-1/4"></div>
        <div className="w-3/4"></div>
      </div>
    </div>
  );
}
