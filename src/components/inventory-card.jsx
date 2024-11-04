import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { X, Layers3 } from "lucide-react";
import ConditionBadge from "@/components/condition-badge";
import CardActions from "@/components/card-actions";

export default function InventoryCard({ inventoryState, cardImages, selectedIndex, isCardInStack, queue }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
      {inventoryState.map((card, index) => (
        <Card 
    key={card.id} 
    className={`cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors group ${index === selectedIndex ? 'ring-2 ring-primary' : ''}`}
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
  );
}