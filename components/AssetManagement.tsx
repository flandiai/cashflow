import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define types for your props and data structures
interface Player {
  cashflow: number;
  passive: number;
  salary: number;
  expenses: number;
}

interface Asset {
  name: string;
  type: string;
  cost?: number;
  downPayment?: number;
  cashflow?: number;
  units?: number;
  quantity?: number;
  costPerShare?: number;
  costPerCoin?: number;
}

interface AssetManagementProps {
  player: Player;
  updatePlayerState: React.Dispatch<React.SetStateAction<Player>>;
  showAlertMessage: (message: string) => void;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

export const AssetManagement: React.FC<AssetManagementProps> = ({
  player,
  updatePlayerState,
  showAlertMessage,
  assets,
  setAssets,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [selectedStockPrice, setSelectedStockPrice] = useState<string>('');
  const [goldQuantity, setGoldQuantity] = useState<string>('');
  const [goldPrice, setGoldPrice] = useState<string>('');
  const [propertyType, setPropertyType] = useState<string | null>(null);
  const [propertyUnits, setPropertyUnits] = useState<number>(1);
  const [propertyPrice, setPropertyPrice] = useState<string>('');
  const [propertyDownPayment, setPropertyDownPayment] = useState<string>('');
  const [propertyCashflow, setPropertyCashflow] = useState<string>('');

  const stockNames = ['OK4U', 'MYT4U', 'ON2U', 'GRO4US'];
  const stockPrices = [5, 10, 20, 30, 40];
  const propertyTypes = ['MFH', 'EFH', 'ETW', 'Apartment', 'Unternehmen'];

  const handleBuyRealEstate = () => {
    const price = parseInt(propertyPrice);
    const downPayment = parseInt(propertyDownPayment);
    const cashflow = parseInt(propertyCashflow);
    if (!propertyType || !price || !downPayment || !cashflow) {
      showAlertMessage('Bitte füllen Sie alle Felder aus.');
      return;
    }
    if (player.cashflow >= downPayment) {
      const newProperty: Asset = {
        name: `${propertyType} (${propertyUnits} WE)`,
        type: 'Immobilie',
        cost: price,
        downPayment: downPayment,
        cashflow: cashflow,
        units: propertyUnits,
      };
      setAssets([...assets, newProperty]);
      updatePlayerState((prev) => ({
        ...prev,
        cashflow: prev.cashflow - downPayment,
        passive: prev.passive + cashflow,
      }));
      showAlertMessage(
        `Sie haben ${newProperty.name} für eine Anzahlung von ${downPayment}€ gekauft. Es generiert ${cashflow}€ monatlich.`,
      );
    } else {
      showAlertMessage('Sie haben nicht genug Bargeld für die Anzahlung.');
    }
  };

  const handleBuyStock = () => {
    const quantity = parseInt(stockQuantity);
    const price = parseInt(selectedStockPrice);
    if (!selectedAsset || !quantity || !price) {
      showAlertMessage('Bitte füllen Sie alle Felder aus.');
      return;
    }
    const totalCost = quantity * price;
    if (player.cashflow >= totalCost) {
      const newStock: Asset = {
        name: selectedAsset,
        type: 'Aktie',
        quantity: quantity,
        costPerShare: price,
        cost: totalCost,
      };
      setAssets([...assets, newStock]);
      updatePlayerState((prev) => ({
        ...prev,
        cashflow: prev.cashflow - totalCost,
      }));
      showAlertMessage(`Sie haben ${quantity} Aktien von ${selectedAsset} für ${price}€ pro Aktie gekauft.`);
    } else {
      showAlertMessage('Sie haben nicht genug Bargeld, um diese Aktien zu kaufen.');
    }
  };

  const handleBuyGold = () => {
    const quantity = parseInt(goldQuantity);
    const price = parseInt(goldPrice);
    if (!quantity || !price) {
      showAlertMessage('Bitte geben Sie eine gültige Menge und einen Preis ein.');
      return;
    }
    const totalCost = quantity * price;
    if (player.cashflow >= totalCost) {
      const newGold: Asset = {
        name: 'Gold Münze',
        type: 'Gold',
        quantity: quantity,
        costPerCoin: price,
        cost: totalCost,
      };
      setAssets([...assets, newGold]);
      updatePlayerState((prev) => ({
        ...prev,
        cashflow: prev.cashflow - totalCost,
      }));
      showAlertMessage(`Sie haben ${quantity} Gold Münzen für insgesamt ${totalCost}€ gekauft.`);
    } else {
      showAlertMessage('Sie haben nicht genug Bargeld, um diese Gold Münzen zu kaufen.');
    }
  };

  return (
    <Tabs defaultValue="realestate" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="realestate">Immobilien</TabsTrigger>
        <TabsTrigger value="stocks">Aktien</TabsTrigger>
        <TabsTrigger value="gold">Gold</TabsTrigger>
      </TabsList>
      <TabsContent value="realestate">
        <Select onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="Immobilientyp wählen" />
          </SelectTrigger>
          <SelectContent>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Wohneinheiten"
          value={propertyUnits}
          onChange={(e) => setPropertyUnits(Math.max(1, parseInt(e.target.value) || 1))}
          className="mt-2"
        />
        <Input
          type="number"
          placeholder="Kaufpreis"
          value={propertyPrice}
          onChange={(e) => setPropertyPrice(e.target.value)}
          className="mt-2"
        />
        <Input
          type="number"
          placeholder="Anzahlung"
          value={propertyDownPayment}
          onChange={(e) => setPropertyDownPayment(e.target.value)}
          className="mt-2"
        />
        <Input
          type="number"
          placeholder="Monatlicher Cashflow"
          value={propertyCashflow}
          onChange={(e) => setPropertyCashflow(e.target.value)}
          className="mt-2"
        />
        <Button onClick={handleBuyRealEstate} className="mt-4">
          Immobilie kaufen
        </Button>
      </TabsContent>
      <TabsContent value="stocks">
        <Select onValueChange={setSelectedAsset}>
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie eine Aktie" />
          </SelectTrigger>
          <SelectContent>
            {stockNames.map((stock) => (
              <SelectItem key={stock} value={stock}>
                {stock}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Menge"
          value={stockQuantity}
          onChange={(e) => setStockQuantity(e.target.value)}
          className="mt-2"
        />
        <Select onValueChange={setSelectedStockPrice}>
          <SelectTrigger>
            <SelectValue placeholder="Wählen Sie einen Preis" />
          </SelectTrigger>
          <SelectContent>
            {stockPrices.map((price) => (
              <SelectItem key={price} value={price.toString()}>
                {price}€
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleBuyStock} className="mt-4">
          Aktien kaufen
        </Button>
      </TabsContent>
      <TabsContent value="gold">
        <Input
          type="number"
          placeholder="Anzahl der Gold Münzen"
          value={goldQuantity}
          onChange={(e) => setGoldQuantity(e.target.value)}
          className="mt-2"
        />
        <Input
          type="number"
          placeholder="Preis pro Münze"
          value={goldPrice}
          onChange={(e) => setGoldPrice(e.target.value)}
          className="mt-2"
        />
        <Button onClick={handleBuyGold} className="mt-4">
          Gold kaufen
        </Button>
      </TabsContent>
    </Tabs>
  );
};

// Define props for ViewAssets component
interface ViewAssetsProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  updatePlayerState: React.Dispatch<React.SetStateAction<Player>>;
  showAlertMessage: (message: string) => void;
}

export const ViewAssets: React.FC<ViewAssetsProps> = ({ assets, setAssets, updatePlayerState, showAlertMessage }) => {
  const [sellPrice, setSellPrice] = useState<{ [key: number]: string }>({});
  const [sellQuantity, setSellQuantity] = useState<{ [key: number]: string }>({});

  const handleSellAsset = (asset: Asset, index: number) => {
    const price = parseInt(sellPrice[index]);
    const quantity = parseInt(sellQuantity[index]) || asset.quantity!;

    if (!price || (asset.type !== 'Immobilie' && !quantity)) {
      showAlertMessage('Bitte geben Sie einen gültigen Verkaufspreis und ggf. eine Menge ein.');
      return;
    }

    if (asset.type !== 'Immobilie' && quantity! > asset.quantity!) {
      showAlertMessage('Sie können nicht mehr verkaufen als Sie besitzen.');
      return;
    }

    const totalSalePrice = asset.type === 'Immobilie' ? price : price * quantity!;

    updatePlayerState((prev) => ({
      ...prev,
      cashflow: prev.cashflow + totalSalePrice,
      passive: asset.type === 'Immobilie' ? prev.passive - asset.cashflow! : prev.passive,
    }));

    if (asset.type === 'Immobilie' || quantity === asset.quantity) {
      setAssets(assets.filter((_, i) => i !== index));
    } else {
      setAssets(
        assets.map((a, i) => (i === index ? { ...a, quantity: a.quantity! - quantity! } : a)),
      );
    }

    showAlertMessage(
      `Sie haben ${
        asset.type === 'Immobilie' ? asset.name : quantity! + ' ' + asset.name
      } für insgesamt ${totalSalePrice}€ verkauft.`,
    );
  };

  return (
    <div>
      {assets.map((asset, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <strong>{asset.name}</strong> ({asset.type}):
          {asset.type === 'Immobilie'
            ? ` Kosten ${asset.cost}€, Anzahlung ${asset.downPayment}€, Cashflow ${asset.cashflow}€`
            : `${asset.quantity} ${
                asset.type === 'Aktie' ? 'Aktien' : 'Münzen'
              } zu ${asset.costPerShare || asset.costPerCoin}€ pro Stück`}
          {asset.type !== 'Immobilie' && (
            <Input
              type="number"
              placeholder="Menge zum Verkauf"
              value={sellQuantity[index] || ''}
              onChange={(e) => setSellQuantity({ ...sellQuantity, [index]: e.target.value })}
              className="mt-2"
            />
          )}
          <Input
            type="number"
            placeholder={asset.type === 'Immobilie' ? 'Verkaufspreis' : 'Preis pro Stück'}
            value={sellPrice[index] || ''}
            onChange={(e) => setSellPrice({ ...sellPrice, [index]: e.target.value })}
            className="mt-2"
          />
          <Button onClick={() => handleSellAsset(asset, index)} className="mt-2">
            Verkaufen
          </Button>
        </div>
      ))}
    </div>
  );
};
