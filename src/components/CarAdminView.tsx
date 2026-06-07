import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Upload, Trash2, CheckCircle2, Car, Edit3, PlusCircle, ArrowLeft } from 'lucide-react';
import { EVModel, PageType } from '../types';
import { getStoredEVs, saveEV, deleteEV } from '../lib/evService';

interface CarAdminViewProps {
  setCurrentPage: (page: PageType) => void;
  onDatabaseUpdate?: () => void;
}

export default function CarAdminView({ setCurrentPage, onDatabaseUpdate }: CarAdminViewProps) {
  // Authentication State
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Mode: 'list' | 'add' | 'edit'
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list');
  const [carsList, setCarsList] = useState<EVModel[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields State
  const [selectedId, setSelectedId] = useState('');
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<'cars' | 'scooters' | 'bikes' | 'commercial'>('cars');
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(0);
  const [range, setRange] = useState(0);
  const [rangeType, setRangeType] = useState('MIDC');
  const [battery, setBattery] = useState('');
  const [power, setPower] = useState('');
  const [torque, setTorque] = useState('');
  const [topSpeed, setTopSpeed] = useState('');
  const [acceleration, setAcceleration] = useState('');
  const [chargingTime, setChargingTime] = useState('');
  const [chargingAC, setChargingAC] = useState('');
  const [chargingDC, setChargingDC] = useState('');
  const [rating, setRating] = useState(4.5);
  const [reviewsCount, setReviewsCount] = useState(10);
  const [seatingCapacity, setSeatingCapacity] = useState(5);
  const [featured, setFeatured] = useState(false);
  const [popular, setPopular] = useState(false);
  const [newLaunch, setNewLaunch] = useState(false);
  const [description, setDescription] = useState('');
  
  // Image handling
  const [image, setImage] = useState('');
  const [imageType, setImageType] = useState<'url' | 'file'>('url');

  // Pros & Cons lists
  const [pros, setPros] = useState<string[]>(['', '', '']);
  const [cons, setCons] = useState<string[]>(['', '', '']);

  // Fetch cars when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setCarsList(getStoredEVs());
    }
  }, [isAuthenticated, mode, isSuccess]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect system password. Please request database access.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2.5 * 1024 * 1024) {
      alert("Local image file is too large! Please upload images under 2.5MB to preserve memory.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEditClick = (car: EVModel) => {
    setSelectedId(car.id);
    setName(car.name);
    setBrand(car.brand);
    setCategory(car.category);
    setPriceMin(car.priceMin);
    setPriceMax(car.priceMax);
    setRange(car.range);
    setRangeType(car.rangeType);
    setBattery(car.battery);
    setPower(car.power);
    setTorque(car.torque || '');
    setTopSpeed(car.topSpeed || '');
    setAcceleration(car.acceleration || '');
    setChargingTime(car.chargingTime);
    setChargingAC(car.chargingAC || '');
    setChargingDC(car.chargingDC || '');
    setRating(car.rating);
    setReviewsCount(car.reviewsCount);
    setSeatingCapacity(car.seatingCapacity);
    setFeatured(car.featured);
    setPopular(car.popular);
    setNewLaunch(car.newLaunch);
    setDescription(car.description);
    setImage(car.image);
    setImageType(car.image.startsWith('data:') ? 'file' : 'url');
    setPros(car.pros.length > 0 ? [...car.pros] : ['', '', '']);
    setCons(car.cons.length > 0 ? [...car.cons] : ['', '', '']);
    setMode('edit');
  };

  const handleAddNewClick = () => {
    setSelectedId('');
    setName('');
    setBrand('');
    setCategory('cars');
    setPriceMin(0);
    setPriceMax(0);
    setRange(0);
    setRangeType('MIDC');
    setBattery('');
    setPower('');
    setTorque('');
    setTopSpeed('');
    setAcceleration('');
    setChargingTime('');
    setChargingAC('');
    setChargingDC('');
    setRating(4.5);
    setReviewsCount(10);
    setSeatingCapacity(5);
    setFeatured(false);
    setPopular(false);
    setNewLaunch(false);
    setDescription('');
    setImage('');
    setImageType('url');
    setPros(['', '', '']);
    setCons(['', '', '']);
    setMode('add');
  };

  const handleListProsChange = (index: number, val: string) => {
    const newPros = [...pros];
    newPros[index] = val;
    setPros(newPros);
  };

  const handleListConsChange = (index: number, val: string) => {
    const newCons = [...cons];
    newCons[index] = val;
    setCons(newCons);
  };

  const handleDeleteClick = (carId: string, carName: string) => {
    if (confirm(`Are you sure you want to delete "${carName}" from the EV catalog?`)) {
      deleteEV(carId);
      onDatabaseUpdate?.();
      setCarsList(getStoredEVs());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !brand.trim() || !battery.trim() || !chargingTime.trim()) {
      alert("Please fill out the required fields (Name, Brand, Battery capacity, Charging time).");
      return;
    }

    const cleanId = selectedId || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const activePros = pros.filter(p => p.trim() !== '');
    const activeCons = cons.filter(c => c.trim() !== '');

    const newCar: EVModel = {
      id: cleanId,
      name: name.trim(),
      brand: brand.trim(),
      category,
      priceMin,
      priceMax,
      range,
      rangeType,
      battery: battery.trim(),
      power: power.trim(),
      torque: torque.trim() || undefined,
      topSpeed: topSpeed.trim() || undefined,
      acceleration: acceleration.trim() || undefined,
      chargingTime: chargingTime.trim(),
      chargingAC: chargingAC.trim() || undefined,
      chargingDC: chargingDC.trim() || undefined,
      rating,
      reviewsCount,
      seatingCapacity,
      featured,
      popular,
      newLaunch,
      description: description.trim(),
      image: image.trim() || '/favicon.png',
      thumbnails: [],
      pros: activePros,
      cons: activeCons,
    };

    try {
      saveEV(newCar);
      onDatabaseUpdate?.();
      setSuccessMessage(selectedId ? 'Vehicle specs updated successfully!' : 'New vehicle added to catalog!');
      setIsSuccess(true);
    } catch (err) {
      alert("Failed to save changes! The local storage might be full (quota exceeded) due to large image files. Try linking a web URL for the picture instead of uploading a local file.");
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setMode('list');
  };

  // 1. Password login screen
  if (!isAuthenticated) {
    return (
      <div className="bg-[#111317] min-h-screen flex items-center justify-center pt-24 pb-16 text-[#e2e2e8]" id="car-admin-login-screen">
        <div className="max-w-md w-full mx-4 bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/30 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#1b6ca8]/10 border border-[#9acbff]/25 flex items-center justify-center mx-auto text-[#9acbff]">
            <KeyRound className="w-6 h-6" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">EV Admin Console</h1>
            <p className="text-xs text-[#8b919b] font-medium">Authentication required to manage the EV Database</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b] mb-1.5">Console Password</label>
              <input
                type="password"
                placeholder="Enter system password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-3 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                required
              />
            </div>
            
            {authError && (
              <p className="text-[11px] text-[#ff6e6e] font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1b6ca8] text-white py-3 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all cursor-pointer text-center"
            >
              Verify Credentials
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Success screen
  if (isSuccess) {
    return (
      <div className="bg-[#111317] min-h-screen flex items-center justify-center pt-24 pb-16 text-[#e2e2e8]">
        <div className="max-w-md w-full mx-4 bg-[#1a1c20] p-8 rounded-2xl border border-[#414750]/30 shadow-2xl text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-[#00C896]/10 border border-[#00C896]/25 flex items-center justify-center mx-auto text-[#00C896]">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Database Synced!</h1>
            <p className="text-xs text-[#8b919b] font-medium leading-relaxed">
              {successMessage} The system-wide dataset has updated in memory and is active.
            </p>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => setCurrentPage('listings')}
              className="w-full bg-[#00C896] text-[#002116] py-3 font-bold text-xs rounded-xl hover:bg-[#00e3aa] transition-all cursor-pointer text-center"
            >
              View Live EV Listings
            </button>
            <button
              onClick={handleResetForm}
              className="w-full bg-[#111317] text-[#c0c7d1] border border-[#414750]/30 py-3 font-bold text-xs rounded-xl hover:text-white hover:border-[#8b919b] transition-all cursor-pointer text-center"
            >
              Return to DB List
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. EV Management Screens
  return (
    <div className="bg-[#111317] min-h-screen pt-24 pb-16 text-[#e2e2e8]" id="car-admin-dashboard">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#414750]/20 mb-8">
          <div>
            <span className="text-[10px] text-[#9acbff] font-mono tracking-widest uppercase font-bold flex items-center gap-1.5">
              <Car className="w-4 h-4" />
              EV Database Administrator
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans mt-1">
              {mode === 'list' ? 'Manage EV Database' : mode === 'add' ? 'Add New Electric Vehicle' : `Edit ${name}`}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {mode !== 'list' && (
              <button
                onClick={() => setMode('list')}
                className="text-xs font-bold text-[#8b919b] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to List
              </button>
            )}
            <button
              onClick={() => setCurrentPage('blog-admin')}
              className="text-xs font-bold text-[#9acbff] hover:text-[#b4d6ff] transition-all cursor-pointer"
            >
              Switch to Blog Admin
            </button>
            <button
              onClick={() => setCurrentPage('listings')}
              className="text-xs font-bold text-[#8b919b] hover:text-white transition-all cursor-pointer"
            >
              Exit Console
            </button>
          </div>
        </div>

        {/* MODE 1: LIST VIEW */}
        {mode === 'list' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/30">
              <span className="text-xs font-bold text-[#8b919b]">Total Vehicles in Database: {carsList.length}</span>
              <button
                onClick={handleAddNewClick}
                className="bg-[#00C896] text-black font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,200,150,0.15)]"
              >
                <PlusCircle className="w-4 h-4" />
                Add New EV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carsList.map((car) => (
                <div key={car.id} className="bg-[#1a1c20] p-4 rounded-xl border border-[#414750]/20 flex items-center gap-4 hover:border-[#9acbff]/35 transition-all">
                  <div className="w-20 h-14 bg-[#111317] rounded-lg overflow-hidden border border-[#414750]/20 p-1 flex items-center justify-center">
                    <img 
                      src={car.image} 
                      alt={car.name} 
                      className="max-w-full max-h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-mono tracking-widest text-[#00C896] uppercase">{car.brand}</span>
                    <h3 className="text-sm font-bold text-white truncate">{car.name}</h3>
                    <p className="text-xs text-[#8b919b] mt-0.5">₹{car.priceMin}L - ₹{car.priceMax}L | {car.range} km</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(car)}
                      className="p-2 bg-[#282a2e] text-[#9acbff] hover:bg-[#9acbff] hover:text-black rounded-lg transition-all"
                      title="Edit vehicle specs"
                    >
                      <Edit3 className="w-4 h-4 cursor-pointer" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(car.id, car.name)}
                      className="p-2 bg-[#282a2e] text-[#ff6e6e] hover:bg-[#ff6e6e] hover:text-white rounded-lg transition-all"
                      title="Delete vehicle"
                    >
                      <Trash2 className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 2 & 3: FORM WORKSPACE */}
        {mode !== 'list' && (
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Primary Details Block */}
            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b] pb-2 border-b border-[#414750]/20">
                Primary Specs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">EV Model Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Nexon EV"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Brand / Maker *</label>
                  <input
                    type="text"
                    placeholder="e.g. Tata Motors"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Category *</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  >
                    <option value="cars">Electric Cars</option>
                    <option value="scooters">Scooters</option>
                    <option value="bikes">Bikes</option>
                    <option value="commercial">Commercial Vehicles</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Min Price (Lakhs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceMin}
                    onChange={(e) => setPriceMin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Max Price (Lakhs) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={priceMax}
                    onChange={(e) => setPriceMax(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Certified Range (km) *</label>
                  <input
                    type="number"
                    value={range}
                    onChange={(e) => setRange(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Range Standard Type *</label>
                  <input
                    type="text"
                    placeholder="e.g. MIDC, ARAI, NEDC"
                    value={rangeType}
                    onChange={(e) => setRangeType(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Battery Capacity *</label>
                  <input
                    type="text"
                    placeholder="e.g. 40.5 kWh"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Motor Power *</label>
                  <input
                    type="text"
                    placeholder="e.g. 142.68 bhp"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Telemetry Specs Block */}
            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b] pb-2 border-b border-[#414750]/20">
                Technical Telemetry & Badges
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Peak Torque</label>
                  <input
                    type="text"
                    placeholder="e.g. 250 Nm"
                    value={torque}
                    onChange={(e) => setTorque(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Top Speed</label>
                  <input
                    type="text"
                    placeholder="e.g. 150 kmph"
                    value={topSpeed}
                    onChange={(e) => setTopSpeed(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Acceleration</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.9 seconds"
                    value={acceleration}
                    onChange={(e) => setAcceleration(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Charging Time *</label>
                  <input
                    type="text"
                    placeholder="e.g. 56 mins (10-80% DC)"
                    value={chargingTime}
                    onChange={(e) => setChargingTime(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">AC Charging Info</label>
                  <input
                    type="text"
                    placeholder="e.g. 7.2 kW (Type 2)"
                    value={chargingAC}
                    onChange={(e) => setChargingAC(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">DC Charging Info</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 kW (CCS2)"
                    value={chargingDC}
                    onChange={(e) => setChargingDC(e.target.value)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Rating *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseFloat(e.target.value) || 4.5)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Reviews Count *</label>
                  <input
                    type="number"
                    value={reviewsCount}
                    onChange={(e) => setReviewsCount(parseInt(e.target.value) || 10)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">Seating Capacity *</label>
                  <input
                    type="number"
                    value={seatingCapacity}
                    onChange={(e) => setSeatingCapacity(parseInt(e.target.value) || 5)}
                    className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/40 rounded-xl px-4 py-3 focus:outline-none focus:border-[#9acbff] transition-all"
                    required
                  />
                </div>
              </div>

              {/* Badges / Checkboxes */}
              <div className="pt-4 border-t border-[#414750]/20 flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#414750]/40 text-[#1b6ca8] focus:ring-0 bg-[#111317]"
                  />
                  Featured EV (appears in sliders/banners)
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={popular}
                    onChange={(e) => setPopular(e.target.checked)}
                    className="w-4 h-4 rounded border-[#414750]/40 text-[#1b6ca8] focus:ring-0 bg-[#111317]"
                  />
                  Popular EV (ranks on homepage listings)
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-white cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newLaunch}
                    onChange={(e) => setNewLaunch(e.target.checked)}
                    className="w-4 h-4 rounded border-[#414750]/40 text-[#1b6ca8] focus:ring-0 bg-[#111317]"
                  />
                  New Launch Badge
                </label>
              </div>
            </div>

            {/* Image & Description */}
            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b] pb-2 border-b border-[#414750]/20">
                Media & Context Description
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image upload selector */}
                <div className="bg-[#111317] p-4 rounded-xl border border-[#414750]/25 flex flex-col space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b919b]">
                      EV Picture (Cover)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 bg-[#1a1c20] p-1 rounded-lg border border-[#414750]/20">
                    <button
                      type="button"
                      onClick={() => setImageType('url')}
                      className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        imageType === 'url' ? 'bg-[#1b6ca8] text-white' : 'text-[#8b919b]'
                      }`}
                    >
                      Web URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageType('file')}
                      className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        imageType === 'file' ? 'bg-[#1b6ca8] text-white' : 'text-[#8b919b]'
                      }`}
                    >
                      Local File
                    </button>
                  </div>

                  {imageType === 'url' ? (
                    <input
                      type="text"
                      placeholder="https://example.com/car-thumbnail.png"
                      value={image.startsWith('data:') ? '' : image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-[#1a1c20] text-[11px] font-medium text-white border border-[#414750]/30 rounded-lg px-2.5 py-2 focus:outline-none focus:border-[#9acbff] transition-all"
                    />
                  ) : (
                    <div className="relative">
                      <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[#1a1c20] hover:bg-[#202329] border border-[#414750]/35 rounded-lg text-[10px] font-bold text-[#c0c7d1] cursor-pointer transition-all">
                        <Upload className="w-3.5 h-3.5 text-[#9acbff]" />
                        {image ? 'Change Local Picture' : 'Select Local File'}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}

                  {image ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-[#414750]/20 bg-[#1a1c20] p-2 flex items-center justify-center">
                      <img
                        src={image}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg border border-dashed border-[#414750]/40 flex items-center justify-center text-[10px] text-[#8b919b] font-mono">
                      No Preview Available
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8b919b]">Context Description *</label>
                  <textarea
                    placeholder="Enter EV description details..."
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#111317] text-xs leading-relaxed text-[#e2e2e8] border border-[#414750]/40 rounded-xl p-4 focus:outline-none focus:border-[#9acbff] transition-all font-sans"
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Pros and Cons Block */}
            <div className="bg-[#1a1c20] p-6 rounded-2xl border border-[#414750]/30 space-y-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8b919b] pb-2 border-b border-[#414750]/20">
                Pros & Cons (Verdict Highlights)
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#00C896] uppercase font-mono">Advantages (Pros)</h3>
                  {pros.map((pro, index) => (
                    <input
                      key={`pro-${index}`}
                      type="text"
                      placeholder={`Pro highlight #${index + 1}`}
                      value={pro}
                      onChange={(e) => handleListProsChange(index, e.target.value)}
                      className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#9acbff] transition-all"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setPros([...pros, ''])}
                    className="text-[10px] font-bold text-[#00C896] hover:underline"
                  >
                    + Add More Pro Points
                  </button>
                </div>

                {/* Cons */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-[#ff6e6e] uppercase font-mono">Disadvantages (Cons)</h3>
                  {cons.map((con, index) => (
                    <input
                      key={`con-${index}`}
                      type="text"
                      placeholder={`Con highlight #${index + 1}`}
                      value={con}
                      onChange={(e) => handleListConsChange(index, e.target.value)}
                      className="w-full bg-[#111317] text-xs font-semibold text-white border border-[#414750]/30 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#9acbff] transition-all"
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setCons([...cons, ''])}
                    className="text-[10px] font-bold text-[#ff6e6e] hover:underline"
                  >
                    + Add More Con Points
                  </button>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => setMode('list')}
                className="bg-[#1a1c20] text-[#c0c7d1] border border-[#414750]/40 py-3 px-8 font-bold text-xs rounded-xl hover:text-white hover:border-[#8b919b] transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-[#1b6ca8] text-white py-3 px-8 font-bold text-xs rounded-xl hover:bg-[#114f7d] transition-all cursor-pointer text-center"
              >
                {selectedId ? 'Update Specs' : 'Publish to Catalog'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
