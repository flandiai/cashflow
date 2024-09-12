'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Minus, DollarSign, TrendingUp, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AssetManagement, ViewAssets } from '@/components/AssetManagement';
import { Asset } from './types';

const CashFlowApp = () => {
  const [player, setPlayer] = useState({
    cashflow: 5000,
    passive: 0,
    salary: 3000,
    expenses: 2500
  });

  const [assets, setAssets] = useState<Asset[]>([]);
  const [currentLoan, setCurrentLoan] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });
  const [showCashflowEdit, setShowCashflowEdit] = useState(false);
  const [tempExpenseIncome, setTempExpenseIncome] = useState(0);

  const calculateTotalValues = useCallback(() => {
    const totalPassiveIncome = assets.reduce((total, asset: Asset) => total + (asset.cashflow || 0), 0);
    setPlayer(prev => ({
      ...prev,
      passive: totalPassiveIncome,
    }));
  }, [assets]);

  useEffect(() => {
    calculateTotalValues();
  }, [calculateTotalValues]);

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 3000);
  };

  const handleChange = (field, value) => {
    const newValue = Math.max(0, parseInt(value) || 0);
    setPlayer(prev => ({ ...prev, [field]: newValue }));
  };

  const adjustValue = (field, amount) => {
    if (field === 'tempExpenseIncome') {
      setTempExpenseIncome(prev => prev + amount);
    } else {
      handleChange(field, player[field] + amount);
    }
  };

  const handlePayday = () => {
    const newCashflow = player.salary + player.passive - player.expenses;
    setPlayer(prev => ({ ...prev, cashflow: Math.max(0, prev.cashflow + newCashflow) }));
    showAlertMessage(`Zahltag! Sie haben ${newCashflow}€ erhalten.`);
  };

  const handleBuyAsset = () => {
    setDialogContent({
      title: 'Asset kaufen',
      description: <AssetManagement 
        player={player} 
        updatePlayerState={setPlayer} 
        showAlertMessage={showAlertMessage}
        assets={assets}
        setAssets={setAssets}
      />,
    });
    setShowDialog(true);
  };

  const handleLoan = (action) => {
    if (action === 'add') {
      setCurrentLoan(prevLoan => prevLoan + 1000);
      setPlayer(prev => ({
        ...prev,
        cashflow: prev.cashflow + 1000,
        expenses: prev.expenses + 100
      }));
      showAlertMessage("Sie haben einen Kredit über 1000€ aufgenommen. Ihre monatlichen Ausgaben sind um 100€ gestiegen.");
    } else if (action === 'repay') {
      if (currentLoan >= 1000 && player.cashflow >= 1000) {
        setCurrentLoan(prevLoan => prevLoan - 1000);
        setPlayer(prev => ({
          ...prev,
          cashflow: prev.cashflow - 1000,
          expenses: prev.expenses - 100
        }));
        showAlertMessage("Sie haben 1000€ Ihres Kredits zurückgezahlt. Ihre monatlichen Ausgaben sind um 100€ gesunken.");
      } else {
        showAlertMessage("Sie können keinen Kredit zurückzahlen. Entweder haben Sie keinen Kredit oder nicht genug Bargeld.");
      }
    }
  };

  const handleExpenseIncomeSubmit = () => {
    setPlayer(prev => ({
      ...prev,
      cashflow: prev.cashflow + tempExpenseIncome,
    }));
    setTempExpenseIncome(0);
    showAlertMessage(`${tempExpenseIncome >= 0 ? 'Einnahme' : 'Ausgabe'} von ${Math.abs(tempExpenseIncome)}€ gebucht.`);
  };

  const renderInputWithAdjust = (field, label) => (
    <div className="flex items-center mb-2">
      <label className="w-1/3">{label}:</label>
      <Input
        type="number"
        value={field === 'tempExpenseIncome' ? tempExpenseIncome : player[field]}
        onChange={(e) => field === 'tempExpenseIncome' ? setTempExpenseIncome(parseInt(e.target.value) || 0) : handleChange(field, e.target.value)}
        className="w-1/3 mr-2 bg-gray-800 text-white"
      />
      <Button onClick={() => adjustValue(field, -100)} className="mr-1 bg-red-500 text-white"><Minus size={16} /></Button>
      <Button onClick={() => adjustValue(field, 100)} className="bg-green-500 text-white"><Plus size={16} /></Button>
    </div>
  );

  return (
    <div className="p-4 bg-gray-800 text-white min-h-screen relative">
      <div className="absolute top-2 right-2 text-yellow-400 text-sm">v 0.1 AI-Andi</div>
      <h1 className="text-3xl font-bold text-center mb-6 text-yellow-400">Cash Flow 101</h1>
      
      {showAlert && (
        <Alert className="mb-4 bg-blue-500 text-white">
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="bg-gray-700 text-white relative">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2" /> Aktuelles Guthaben
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{player.cashflow}€</p>
          </CardContent>
          <Button 
            className="absolute top-2 right-2 p-1 min-w-0 h-auto bg-transparent hover:bg-gray-600"
            onClick={() => setShowCashflowEdit(true)}
          >
            <Edit size={16} />
          </Button>
        </Card>
        <Card className="bg-gray-700 text-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2" /> Passives Einkommen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{player.passive}€</p>
            <p className="text-red-500">Fehlendes passives Einkommen: {Math.max(0, player.expenses - player.passive)}€</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6 bg-gray-700 text-white">
        <CardHeader>
          <CardTitle>EINKOMMENSÜBERSICHT</CardTitle>
        </CardHeader>
        <CardContent>
          {renderInputWithAdjust('salary', 'Gehalt')}
          <p>Passives Einkommen: {player.passive}€</p>
          <p className="font-bold">Gesamtes Einkommen: {player.salary + player.passive}€</p>
          {renderInputWithAdjust('expenses', 'Monatliche Gesamtausgaben')}
          <div className="flex items-center mt-2">
            <span className="mr-2">Kreditkosten:</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded">{currentLoan > 0 ? Math.floor(currentLoan / 10) : 0}€</span>
          </div>
          <div className="flex items-center mt-2">
            <span className="mr-2">Monatlicher Cashflow:</span>
            <span className={`px-2 py-1 rounded ${player.salary + player.passive - player.expenses >= 0 ? 'bg-green-500' : 'bg-red-500'}`}>
              {player.salary + player.passive - player.expenses}€
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Button onClick={handlePayday} className="bg-green-500 text-white">Zahltag</Button>
        <Button onClick={handleBuyAsset} className="bg-purple-500 text-white">Asset kaufen</Button>
        <div className="col-span-2 md:col-span-1 flex flex-col">
          {renderInputWithAdjust('tempExpenseIncome', 'Ausgaben/Einnahmen')}
          <Button onClick={handleExpenseIncomeSubmit} className="mt-2 bg-blue-500 text-white">Buchen</Button>
        </div>
      </div>

      <Card className="bg-gray-700 text-white">
        <CardHeader>
          <CardTitle>Kreditverwaltung</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aktueller Kredit: {currentLoan}€</p>
          <div className="flex items-center mt-2">
            <span className="mr-2">Monatliche Kreditkosten:</span>
            <span className="bg-red-500 text-white px-2 py-1 rounded">{currentLoan > 0 ? Math.floor(currentLoan / 10) : 0}€</span>
          </div>
          <div className="flex mt-2">
            <Button onClick={() => handleLoan('repay')} className="mr-2 bg-red-500 text-white">
              <Minus className="mr-1" /> Kredit zurückzahlen
            </Button>
            <Button onClick={() => handleLoan('add')} className="bg-green-500 text-white">
              <Plus className="mr-1" /> Kredit aufnehmen
            </Button>
          </div>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Ihre Assets:</h3>
            <ViewAssets 
              assets={assets} 
              setAssets={setAssets} 
              updatePlayerState={setPlayer}
              showAlertMessage={showAlertMessage}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{dialogContent.title}</DialogTitle>
          </DialogHeader>
          {dialogContent.description}
          <DialogFooter>
            <Button onClick={() => setShowDialog(false)} className="bg-red-500 text-white">Schließen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCashflowEdit} onOpenChange={setShowCashflowEdit}>
        <DialogContent className="bg-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Aktuelles Guthaben bearbeiten</DialogTitle>
          </DialogHeader>
          <Input
            type="number"
            value={player.cashflow}
            onChange={(e) => handleChange('cashflow', e.target.value)}
            className="bg-gray-800 text-white"
          />
          <DialogFooter>
            <Button onClick={() => setShowCashflowEdit(false)} className="bg-green-500 text-white">Bestätigen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashFlowApp;