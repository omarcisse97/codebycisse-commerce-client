import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { medusaClient } from "./utils/client";
import './App.css'
import RegionSelector from "./components/RegionSelector";
import NavHeader from './components/NavHeader'
import Home from './routes/Home'
import Product from './routes/Product'
import Search from "./routes/Search";

function App() {

  const [regionid, setRegionid] = useState(localStorage.getItem('region'));
  const [regionObj, setRegionObj] = useState({});
  const [cart, setCart] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const getRegions = async() => {
      const regions = await medusaClient.store.region.retrieve(regionid);
      setRegionObj(regions);
    }
    const attemptCustomerRetrieve = async() => {
      const temp = await medusaClient.store.customer.retrieve();
      if(temp?.customer?.has_account === true && temp?.customer?.id !== null){
        if(!localStorage.getItem('loggedIn')){
          localStorage.setItem('loggedIn', "true");
        }
        setLoggedIn(true);
      } else {
        if(!localStorage.getItem('loggedIn')){
          localStorage.setItem('loggedIn', "false");
        }
      }
    };
    if(regionid){
      getRegions();
      // getUserRegion();
    }
    if(!localStorage.getItem('loggedIn') || localStorage.getItem('loggedIn') === 'true'){
      attemptCustomerRetrieve();
    } 
  }, []);
  

  useEffect(() => {
    const createCart = async () => {
            try {
                const temp = await medusaClient.store.cart.create({ region_id: regionid });
                setCart(cart);
            } catch (err) {
                console.error("Failed to create cart:", err);
                setError("Failed to create shopping cart.");
            }
        };
    if(regionid){
      createCart();
    }
  }, [regionid])

  useEffect(() => {
    const getRegions = async() => {
      const regions = await medusaClient.store.region.retrieve(regionid);
      setRegionObj(regions);
    }
    if(regionid){
      getRegions();
    }
  }, [regionid])

  const onRegionSelect = (regionSelected) => {
   
    setRegionid(regionSelected);
    localStorage.setItem('region', regionSelected);
  }
  
  return (
    <div className="App">
      {!regionid && <RegionSelector onRegionSelect={onRegionSelect} /> }
      <NavHeader regionid={regionid} onRegionSelect={onRegionSelect} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <Routes>
        <Route path="/" element={<Home regionid={regionid} onRegionSelect={onRegionSelect} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="products/:id" element={<Product regionid={regionid} onRegionSelect={onRegionSelect} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        <Route path="search/:keyword" element={<Search regionid={regionid} onRegionSelect={onRegionSelect} loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
      </Routes>
    </div>
  )
}

export default App