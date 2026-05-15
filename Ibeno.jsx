"use client";
import { useState, useEffect } from "react";

/* ─── DONNÉES ─────────────────────────────────────────────────────────────── */
const PRODUCTS = [
  { id:1, name:"Robe Wax Élegance", price:15000, stock:10, category:"Femme", image:"👗", description:"Robe en tissu wax 100% coton, coupe moderne et élégante", sizes:["S","M","L","XL"], colors:["Bleu","Rouge","Vert"], sales:34 },
  { id:2, name:"Chemise Batik Premium", price:12000, stock:8, category:"Homme", image:"👔", description:"Chemise batik artisanale, parfaite pour toutes occasions", sizes:["S","M","L","XL","XXL"], colors:["Blanc","Noir","Beige"], sales:21 },
  { id:3, name:"Sac à Main Cuir", price:22000, stock:5, category:"Accessoires", image:"👜", description:"Sac à main en cuir véritable, style moderne africain", sizes:["Unique"], colors:["Marron","Noir","Camel"], sales:18 },
  { id:4, name:"Sneakers Urban", price:28000, stock:12, category:"Chaussures", image:"👟", description:"Sneakers tendance confortables, idéales au quotidien", sizes:["38","39","40","41","42","43","44"], colors:["Blanc","Noir","Gris"], sales:42 },
  { id:5, name:"Ensemble Bogolan", price:35000, stock:6, category:"Femme", image:"👘", description:"Ensemble deux pièces en tissu bogolan traditionnel", sizes:["S","M","L","XL"], colors:["Naturel","Indigo"], sales:15 },
  { id:6, name:"Ceinture Artisanale", price:8500, stock:20, category:"Accessoires", image:"🎀", description:"Ceinture artisanale tressée main, finition soignée", sizes:["85cm","90cm","95cm","100cm"], colors:["Marron","Noir"], sales:58 },
  { id:7, name:"Pantalon Kente", price:18000, stock:9, category:"Homme", image:"👖", description:"Pantalon en tissu kente, élégance africaine contemporaine", sizes:["S","M","L","XL","XXL"], colors:["Multicolore"], sales:27 },
  { id:8, name:"Collier Perles", price:6500, stock:15, category:"Accessoires", image:"📿", description:"Collier en perles artisanales fait main en Côte d'Ivoire", sizes:["Unique"], colors:["Multicolore","Or","Argent"], sales:63 },
];

const TRACKING_STEPS = [
  { label:"Commande reçue", icon:"📋" },
  { label:"Paiement confirmé", icon:"✅" },
  { label:"En préparation", icon:"📦" },
  { label:"Expédié", icon:"🚚" },
  { label:"En livraison", icon:"🛵" },
  { label:"Livré", icon:"🎉" },
];

const PAYMENT_METHODS = [
  { id:"wave", name:"Wave", color:"#1D9BF0", logo:"🌊", desc:"Paiement instantané Wave CI", number:"Numéro Wave" },
  { id:"orange", name:"Orange Money", color:"#FF6600", logo:"🟠", desc:"Orange Money Côte d'Ivoire", number:"Numéro Orange" },
  { id:"moov", name:"Moov Money", color:"#0066CC", logo:"🔵", desc:"Moov Africa Money CI", number:"Numéro Moov" },
  { id:"mtn", name:"MTN MoMo", color:"#FFCC00", logo:"🟡", desc:"MTN Mobile Money CI", number:"Numéro MTN" },
  { id:"visa", name:"Carte Visa/CB", color:"#1A1F71", logo:"💳", desc:"Visa, Mastercard, CB", number:null },
];

const INITIAL_ORDERS = [
  { id:"IBENO-001", customer:"Adjoua Konan", phone:"07 12 34 56 78", products:[{id:1,name:"Robe Wax Élegance",qty:1,price:15000,size:"M",color:"Bleu"}], total:15000, status:4, date:"2026-05-10", address:"Cocody, Abidjan", payMethod:"wave", paid:true },
  { id:"IBENO-002", customer:"Kouamé Yao", phone:"05 98 76 54 32", products:[{id:2,name:"Chemise Batik Premium",qty:2,price:12000,size:"L",color:"Blanc"},{id:8,name:"Collier Perles",qty:1,price:6500,size:"Unique",color:"Or"}], total:30500, status:2, date:"2026-05-12", address:"Yopougon, Abidjan", payMethod:"orange", paid:true },
  { id:"IBENO-003", customer:"Fatou Diallo", phone:"01 23 45 67 89", products:[{id:5,name:"Ensemble Bogolan",qty:1,price:35000,size:"L",color:"Indigo"}], total:35000, status:1, date:"2026-05-13", address:"Marcory, Abidjan", payMethod:"mtn", paid:false },
];

const fmt = (n) => new Intl.NumberFormat("fr-CI").format(n) + " FCFA";

/* ─── APP ─────────────────────────────────────────────────────────────────── */
export default function Ibeno() {
  const [view, setView] = useState("shop");
  const [products, setProducts] = useState(PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [cart, setCart] = useState([]);
  const [trackId, setTrackId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("Tout");
  const [editProd, setEditProd] = useState(null);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [adminPass, setAdminPass] = useState("");
  const [notif, setNotif] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showNotif = (msg, type="success") => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);
  const cartTotal = cart.reduce((s,i)=>s+i.price*i.qty,0);
  const categories = ["Tout", ...new Set(PRODUCTS.map(p=>p.category))];

  const addToCart = (p, size, color) => {
    const key = `${p.id}-${size}-${color}`;
    setCart(prev => {
      const ex = prev.find(i=>i.key===key);
      return ex ? prev.map(i=>i.key===key?{...i,qty:i.qty+1}:i) : [...prev,{...p,qty:1,size,color,key}];
    });
    showNotif(`${p.name} ajouté au panier !`);
  };

  const remFromCart = (key) => setCart(prev=>prev.filter(i=>i.key!==key));
  const updQty = (key,qty) => qty<1 ? remFromCart(key) : setCart(prev=>prev.map(i=>i.key===key?{...i,qty}:i));

  const placeOrder = (info) => {
    const o = {
      id:`IBENO-${String(orders.length+1).padStart(3,"0")}`,
      customer:info.name, phone:info.phone,
      products:cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price,size:i.size,color:i.color})),
      total:cartTotal, status:1,
      date:new Date().toISOString().split("T")[0],
      address:info.address, payMethod:info.payMethod, paid:true,
    };
    setOrders(prev=>[...prev,o]);
    setLastOrderId(o.id);
    setCart([]);
    setView("success");
  };

  const trackOrder = () => {
    const o = orders.find(o=>o.id===trackId.trim().toUpperCase());
    setTrackedOrder(o||null);
    if(!o) showNotif("Commande introuvable","error");
  };

  const saveProd = (p) => {
    if(p.id) { setProducts(prev=>prev.map(x=>x.id===p.id?p:x)); showNotif("Produit mis à jour !"); }
    else { setProducts(prev=>[...prev,{...p,id:Date.now(),sales:0}]); showNotif("Produit ajouté !"); }
    setEditProd(null); setView("admin-products");
  };

  const delProd = (id) => { setProducts(prev=>prev.filter(p=>p.id!==id)); showNotif("Produit supprimé !"); };
  const updStatus = (id,status) => { setOrders(prev=>prev.map(o=>o.id===id?{...o,status}:o)); showNotif("Statut mis à jour !"); };

  const filtered = products.filter(p=>
    (filterCat==="Tout"||p.category===filterCat) &&
    (p.name.toLowerCase().includes(searchQ.toLowerCase())||p.category.toLowerCase().includes(searchQ.toLowerCase()))
  );

  const navTo = (v) => { setView(v); setMenuOpen(false); };

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#FAF8F5;}
        input::placeholder{color:#bbb;}
        textarea::placeholder{color:#bbb;}
        button:hover{opacity:0.88;}
        select{appearance:none;}
        .card-hover:hover{transform:translateY(-4px);box-shadow:0 16px 40px rgba(0,0,0,0.12)!important;}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideRight{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
        .anim-fade{animation:fadeDown 0.4s ease;}
        .anim-slide{animation:slideRight 0.35s ease;}
      `}</style>

      {/* NOTIF */}
      {notif && (
        <div style={{...s.notif, background:notif.type==="error"?"#e53e3e":"#2D6A4F"}} className="anim-fade">
          {notif.type==="error"?"⚠️":"✅"} {notif.msg}
        </div>
      )}

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand} onClick={()=>navTo("shop")}>
            <div style={s.brandLogo}>I</div>
            <div>
              <div style={s.brandName}>IBENO</div>
              <div style={s.brandSub}>Mode & Accessoires · CI</div>
            </div>
          </div>

          {/* Desktop nav */}
          <div style={s.navLinks}>
            <NavBtn active={view==="shop"} onClick={()=>navTo("shop")}>Boutique</NavBtn>
            <NavBtn active={view==="tracking"} onClick={()=>navTo("tracking")}>📦 Suivi</NavBtn>
            <NavBtn active={view.startsWith("admin")} onClick={()=>navTo(adminAuth?"admin":"admin-login")}>⚙️ Admin</NavBtn>
          </div>

          <button style={s.cartBtn} onClick={()=>navTo("cart")}>
            🛒
            {cartCount>0 && <span style={s.cartBadge}>{cartCount}</span>}
            <span style={{color:"#F4A261",fontWeight:700}}>{fmt(cartTotal)}</span>
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <main style={s.main}>
        {view==="shop" && <Shop products={filtered} categories={categories} filterCat={filterCat} setFilterCat={setFilterCat} searchQ={searchQ} setSearchQ={setSearchQ} onAdd={addToCart} />}
        {view==="cart" && <Cart cart={cart} total={cartTotal} onRemove={remFromCart} onQty={updQty} onCheckout={()=>navTo("checkout")} onBack={()=>navTo("shop")} />}
        {view==="checkout" && <Checkout total={cartTotal} onPlace={placeOrder} onBack={()=>navTo("cart")} />}
        {view==="success" && <Success orderId={lastOrderId} onTrack={()=>{setTrackId(lastOrderId);navTo("tracking");}} onShop={()=>navTo("shop")} />}
        {view==="tracking" && <Tracking trackId={trackId} setTrackId={setTrackId} order={trackedOrder} onTrack={trackOrder} />}
        {view==="admin-login" && <AdminLogin pass={adminPass} setPass={setAdminPass} onLogin={()=>{if(adminPass==="ibeno2024"){setAdminAuth(true);navTo("admin");}else showNotif("Mot de passe incorrect","error");}} />}
        {view==="admin" && adminAuth && <Dashboard products={products} orders={orders} onNav={navTo} />}
        {view==="admin-products" && adminAuth && <AdminProducts products={products} onEdit={p=>{setEditProd(p);navTo("admin-form");}} onDelete={delProd} onAdd={()=>{setEditProd(null);navTo("admin-form");}} onBack={()=>navTo("admin")} />}
        {view==="admin-orders" && adminAuth && <AdminOrders orders={orders} onStatus={updStatus} onBack={()=>navTo("admin")} />}
        {view==="admin-form" && adminAuth && <ProductForm product={editProd} onSave={saveProd} onBack={()=>navTo("admin-products")} />}
      </main>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <div style={{...s.brandLogo,width:36,height:36,fontSize:18}}>I</div>
            <div>
              <div style={{fontWeight:800,fontSize:18,fontFamily:"'Playfair Display',serif"}}>IBENO</div>
              <div style={{fontSize:12,color:"#aaa"}}>Mode & Accessoires · Abidjan, CI</div>
            </div>
          </div>
          <div style={s.footerPay}>
            <div style={{fontSize:13,color:"#aaa",marginBottom:8}}>Paiements acceptés</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {PAYMENT_METHODS.map(m=>(
                <div key={m.id} style={{background:m.color,color:m.id==="mtn"?"#000":"#fff",padding:"4px 10px",borderRadius:8,fontSize:12,fontWeight:700}}>
                  {m.logo} {m.name}
                </div>
              ))}
            </div>
          </div>
          <div style={{color:"#666",fontSize:13}}>
            <div>📍 Abidjan, Côte d'Ivoire</div>
            <div>📞 +225 07 XX XX XX XX</div>
            <div>✉️ contact@ibeno.ci</div>
          </div>
        </div>
        <div style={{textAlign:"center",color:"#555",fontSize:12,padding:"16px 0 0",borderTop:"1px solid #2a2a2a",marginTop:24}}>
          © 2026 IBENO — Tous droits réservés · Fait avec ❤️ en Côte d'Ivoire
        </div>
      </footer>
    </div>
  );
}

/* ─── SHOP ────────────────────────────────────────────────────────────────── */
function Shop({ products, categories, filterCat, setFilterCat, searchQ, setSearchQ, onAdd }) {
  const [selected, setSelected] = useState(null);
  const [selSize, setSelSize] = useState("");
  const [selColor, setSelColor] = useState("");

  const openModal = (p) => { setSelected(p); setSelSize(p.sizes[0]); setSelColor(p.colors[0]); };

  return (
    <div>
      {/* HERO */}
      <div style={s.hero}>
        <div style={s.heroContent}>
          <div style={s.heroBadge}>🇨🇮 Livraison à Abidjan & CI</div>
          <h1 style={s.heroTitle}>Mode Africaine<br /><span style={{color:"#F4A261"}}>Authentique</span></h1>
          <p style={s.heroSub}>Vêtements & Accessoires tendance livrés chez vous en Côte d'Ivoire</p>
          <div style={s.heroSearch}>
            <span style={{fontSize:18}}>🔍</span>
            <input style={s.heroInput} placeholder="Rechercher robes, chemises, sacs..." value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
          </div>
          <div style={s.heroPay}>
            <span style={{color:"rgba(255,255,255,0.7)",fontSize:13}}>Payez avec :</span>
            {PAYMENT_METHODS.map(m=>(
              <div key={m.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:8,padding:"4px 10px",fontSize:12,fontWeight:700,backdropFilter:"blur(10px)"}}>
                {m.logo} {m.name}
              </div>
            ))}
          </div>
        </div>
        <div style={s.heroDecor}>
          <div style={s.heroEmoji}>👗</div>
          <div style={{...s.heroEmoji,top:"60%",left:"60%",fontSize:40,animationDelay:"1s"}}>👜</div>
          <div style={{...s.heroEmoji,top:"20%",left:"70%",fontSize:30,animationDelay:"2s"}}>📿</div>
        </div>
      </div>

      {/* CATS */}
      <div style={s.catBar}>
        {categories.map(c=>(
          <button key={c} style={{...s.catBtn,background:filterCat===c?"#2D3436":"transparent",color:filterCat===c?"#fff":"#555",border:filterCat===c?"2px solid #2D3436":"2px solid #e0e0e0"}} onClick={()=>setFilterCat(c)}>{c}</button>
        ))}
      </div>

      {/* GRID */}
      <div style={s.grid}>
        {products.map(p=>(
          <div key={p.id} style={s.card} className="card-hover">
            <div style={s.cardImg}>{p.image}</div>
            <div style={s.cardCat}>{p.category}</div>
            <h3 style={s.cardName}>{p.name}</h3>
            <p style={s.cardDesc}>{p.description}</p>
            <div style={s.cardColors}>
              {p.colors.slice(0,3).map(c=>(
                <span key={c} style={s.colorDot} title={c}></span>
              ))}
              <span style={{fontSize:12,color:"#888"}}>{p.colors.join(", ")}</span>
            </div>
            <div style={s.cardFooter}>
              <div>
                <span style={s.price}>{fmt(p.price)}</span>
                <div style={{...s.stockPill,background:p.stock>5?"#e8f5e9":"#ffebee",color:p.stock>5?"#2e7d32":"#c62828"}}>{p.stock>0?`${p.stock} en stock`:"Rupture"}</div>
              </div>
            </div>
            <button style={{...s.addBtn,opacity:p.stock===0?0.5:1}} disabled={p.stock===0} onClick={()=>openModal(p)}>
              {p.stock===0?"Indisponible":"Choisir & Ajouter"}
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <div style={s.overlay} onClick={()=>setSelected(null)}>
          <div style={s.modal} onClick={e=>e.stopPropagation()} className="anim-fade">
            <button style={s.modalClose} onClick={()=>setSelected(null)}>✕</button>
            <div style={{fontSize:72,textAlign:"center",marginBottom:16}}>{selected.image}</div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,marginBottom:8}}>{selected.name}</h2>
            <p style={{color:"#666",fontSize:14,marginBottom:16}}>{selected.description}</p>
            <div style={s.price}>{fmt(selected.price)}</div>
            <div style={{marginTop:16}}>
              <label style={s.label}>Taille</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {selected.sizes.map(sz=>(
                  <button key={sz} style={{...s.sizeBtn,background:selSize===sz?"#2D3436":"#f5f5f5",color:selSize===sz?"#fff":"#333"}} onClick={()=>setSelSize(sz)}>{sz}</button>
                ))}
              </div>
            </div>
            <div style={{marginTop:16}}>
              <label style={s.label}>Couleur</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {selected.colors.map(cl=>(
                  <button key={cl} style={{...s.sizeBtn,background:selColor===cl?"#2D3436":"#f5f5f5",color:selColor===cl?"#fff":"#333"}} onClick={()=>setSelColor(cl)}>{cl}</button>
                ))}
              </div>
            </div>
            <button style={{...s.addBtn,marginTop:20}} onClick={()=>{onAdd(selected,selSize,selColor);setSelected(null);}}>
              🛒 Ajouter au panier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CART ────────────────────────────────────────────────────────────────── */
function Cart({ cart, total, onRemove, onQty, onCheckout, onBack }) {
  return (
    <div style={s.page}>
      <h2 style={s.pageTitle}>🛒 Mon Panier</h2>
      {cart.length===0 ? (
        <div style={s.empty}>
          <div style={{fontSize:64}}>🛒</div>
          <p style={{marginBottom:20,color:"#666"}}>Votre panier est vide</p>
          <PBtn onClick={onBack}>Voir la boutique</PBtn>
        </div>
      ) : (
        <div style={s.cartLayout}>
          <div>
            {cart.map(item=>(
              <div key={item.key} style={s.cartItem} className="anim-slide">
                <div style={{fontSize:40}}>{item.image}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15}}>{item.name}</div>
                  <div style={{color:"#888",fontSize:13}}>Taille: {item.size} · Couleur: {item.color}</div>
                  <div style={{color:"#F4A261",fontWeight:700,marginTop:4}}>{fmt(item.price)}</div>
                </div>
                <div style={s.qtyCtrl}>
                  <button style={s.qtyBtn} onClick={()=>onQty(item.key,item.qty-1)}>−</button>
                  <span style={{fontWeight:700,minWidth:24,textAlign:"center"}}>{item.qty}</span>
                  <button style={s.qtyBtn} onClick={()=>onQty(item.key,item.qty+1)}>+</button>
                </div>
                <div style={{fontWeight:700,minWidth:100,textAlign:"right"}}>{fmt(item.price*item.qty)}</div>
                <button style={s.remBtn} onClick={()=>onRemove(item.key)}>✕</button>
              </div>
            ))}
          </div>
          <div style={s.summary}>
            <h3 style={{marginBottom:16,fontFamily:"'Playfair Display',serif"}}>Récapitulatif</h3>
            <div style={s.row}><span>Sous-total</span><span>{fmt(total)}</span></div>
            <div style={s.row}><span>Livraison</span><span style={{color:"#2D6A4F",fontWeight:600}}>À définir</span></div>
            <div style={{...s.row,fontWeight:800,fontSize:18,borderTop:"2px solid #eee",paddingTop:12,marginTop:8}}>
              <span>Total</span><span style={{color:"#F4A261"}}>{fmt(total)}</span>
            </div>
            <PBtn onClick={onCheckout}>Commander →</PBtn>
            <SBtn onClick={onBack}>← Continuer</SBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CHECKOUT ────────────────────────────────────────────────────────────── */
function Checkout({ total, onPlace, onBack }) {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({ name:"", phone:"", address:"", city:"Abidjan", quartier:"" });
  const [payMethod, setPayMethod] = useState("wave");
  const [payNum, setPayNum] = useState("");
  const [card, setCard] = useState({ number:"", expiry:"", cvv:"", name:"" });
  const [processing, setProcessing] = useState(false);

  const pay = () => {
    setProcessing(true);
    setTimeout(()=>{ setProcessing(false); onPlace({...info,payMethod}); }, 2200);
  };

  const selPay = PAYMENT_METHODS.find(m=>m.id===payMethod);

  return (
    <div style={s.page}>
      <h2 style={s.pageTitle}>💳 Passer la commande</h2>

      {/* Steps */}
      <div style={{display:"flex",gap:8,marginBottom:32,alignItems:"center"}}>
        {["Livraison","Paiement"].map((st,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:28,height:28,borderRadius:"50%",background:step>i+1?"#2D6A4F":step===i+1?"#2D3436":"#ddd",color:step>=i+1?"#fff":"#999",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13}}>
              {step>i+1?"✓":i+1}
            </div>
            <span style={{fontWeight:step===i+1?700:400,color:step===i+1?"#2D3436":"#999",fontSize:14}}>{st}</span>
            {i<1 && <div style={{width:40,height:2,background:step>1?"#2D6A4F":"#ddd"}} />}
          </div>
        ))}
      </div>

      {step===1 && (
        <div style={s.box}>
          <h3 style={{fontFamily:"'Playfair Display',serif",marginBottom:20}}>📍 Informations de livraison</h3>
          <div style={s.formGrid}>
            <FField label="Nom complet *" name="name" state={info} setState={setInfo} placeholder="Adjoua Konan" />
            <FField label="Téléphone (WhatsApp) *" name="phone" state={info} setState={setInfo} placeholder="+225 07 XX XX XX XX" />
            <FField label="Ville *" name="city" state={info} setState={setInfo} placeholder="Abidjan" />
            <FField label="Quartier / Commune *" name="quartier" state={info} setState={setInfo} placeholder="Cocody, Yopougon..." />
            <div style={{gridColumn:"1/-1"}}>
              <FField label="Adresse complète *" name="address" state={info} setState={setInfo} placeholder="Rue, Immeuble, Repère..." />
            </div>
          </div>
          <div style={{display:"flex",gap:12,marginTop:8}}>
            <SBtn onClick={onBack} style={{flex:1}}>← Retour</SBtn>
            <PBtn onClick={()=>setStep(2)} disabled={!info.name||!info.phone||!info.address} style={{flex:2}}>Continuer →</PBtn>
          </div>
        </div>
      )}

      {step===2 && (
        <div style={s.box}>
          <h3 style={{fontFamily:"'Playfair Display',serif",marginBottom:20}}>💳 Mode de paiement</h3>

          {/* Payment methods */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
            {PAYMENT_METHODS.map(m=>(
              <div key={m.id} style={{...s.payCard,border:payMethod===m.id?`2px solid ${m.color}`:"2px solid #eee",background:payMethod===m.id?`${m.color}10`:"#fff"}}
                onClick={()=>setPayMethod(m.id)}>
                <div style={{fontSize:24}}>{m.logo}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:m.color}}>{m.name}</div>
                  <div style={{fontSize:11,color:"#888"}}>{m.desc}</div>
                </div>
                {payMethod===m.id && <div style={{marginLeft:"auto",color:m.color,fontWeight:700}}>✓</div>}
              </div>
            ))}
          </div>

          {/* Payment detail form */}
          {payMethod!=="visa" ? (
            <div style={s.mobilePayBox}>
              <div style={{fontSize:40,marginBottom:8}}>{selPay.logo}</div>
              <div style={{fontWeight:700,fontSize:18,color:selPay.color,marginBottom:4}}>{selPay.name}</div>
              <div style={{color:"#666",fontSize:14,marginBottom:16}}>Entrez votre numéro {selPay.name}</div>
              <input style={{...s.input,fontSize:16,textAlign:"center",letterSpacing:2}} placeholder={selPay.number} value={payNum} onChange={e=>setPayNum(e.target.value)} />
              <div style={{marginTop:12,background:"#fffbeb",border:"1px solid #fbbf24",borderRadius:10,padding:12,fontSize:13,color:"#92400e"}}>
                ⚠️ Après confirmation, vous recevrez une demande de paiement sur votre téléphone. Validez pour finaliser votre commande.
              </div>
            </div>
          ) : (
            <div>
              <div style={s.cardPreview}>
                <div style={{color:"rgba(255,255,255,0.5)",fontSize:11,marginBottom:20}}>CARTE BANCAIRE · VISA / MASTERCARD</div>
                <div style={{fontSize:17,letterSpacing:4,marginBottom:20}}>{card.number||"•••• •••• •••• ••••"}</div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:14}}>
                  <span>{card.name||"NOM PRÉNOM"}</span>
                  <span>{card.expiry||"MM/AA"}</span>
                </div>
              </div>
              <div style={s.formGrid}>
                <div style={{gridColumn:"1/-1"}}><FField label="Nom sur la carte" name="name" state={card} setState={setCard} placeholder="ADJOUA KONAN" /></div>
                <div style={{gridColumn:"1/-1"}}><FField label="Numéro de carte" name="number" state={card} setState={setCard} placeholder="1234 5678 9012 3456" /></div>
                <FField label="Expiration" name="expiry" state={card} setState={setCard} placeholder="MM/AA" />
                <FField label="CVV" name="cvv" state={card} setState={setCard} placeholder="123" />
              </div>
            </div>
          )}

          <div style={{...s.row,fontWeight:800,fontSize:18,margin:"20px 0 8px",borderTop:"1px solid #eee",paddingTop:16}}>
            <span>Total à payer</span><span style={{color:"#F4A261"}}>{fmt(total)}</span>
          </div>
          <div style={{display:"flex",gap:10,marginTop:8}}>
            <SBtn onClick={()=>setStep(1)} style={{flex:1}}>← Retour</SBtn>
            <PBtn onClick={pay} disabled={processing||(!payNum&&payMethod!=="visa")} style={{flex:2}}>
              {processing?"⏳ Traitement en cours...":`✅ Confirmer ${fmt(total)}`}
            </PBtn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── SUCCESS ─────────────────────────────────────────────────────────────── */
function Success({ orderId, onTrack, onShop }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{...s.box,textAlign:"center",maxWidth:420,padding:48}} className="anim-fade">
        <div style={{fontSize:72,marginBottom:16}}>🎉</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:28,marginBottom:8}}>Commande confirmée !</h2>
        <p style={{color:"#666",marginBottom:20}}>Merci pour votre achat chez IBENO !</p>
        <div style={{background:"#2D3436",color:"#fff",borderRadius:12,padding:"12px 24px",fontSize:16,marginBottom:16,display:"inline-block"}}>
          🧾 {orderId}
        </div>
        <p style={{color:"#666",fontSize:14,marginBottom:24}}>Notez ce numéro pour suivre votre livraison. Vous serez contacté(e) via WhatsApp pour confirmer la livraison.</p>
        <PBtn onClick={onTrack}>📦 Suivre ma commande</PBtn>
        <SBtn onClick={onShop}>Continuer mes achats</SBtn>
      </div>
    </div>
  );
}

/* ─── TRACKING ────────────────────────────────────────────────────────────── */
function Tracking({ trackId, setTrackId, order, onTrack }) {
  const pm = order ? PAYMENT_METHODS.find(m=>m.id===order.payMethod) : null;
  return (
    <div style={s.page}>
      <h2 style={s.pageTitle}>📦 Suivi de commande</h2>
      <p style={{color:"#666",marginBottom:24}}>Entrez votre numéro de commande pour suivre votre livraison en temps réel.</p>
      <div style={{display:"flex",gap:12,marginBottom:32,maxWidth:500}}>
        <input style={{...s.input,flex:1}} placeholder="Ex: IBENO-001" value={trackId} onChange={e=>setTrackId(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onTrack()} />
        <PBtn onClick={onTrack} style={{width:"auto",padding:"0 24px"}}>Rechercher</PBtn>
      </div>

      {order && (
        <div style={{...s.box,padding:28}} className="anim-fade">
          {/* Header */}
          <div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:12,paddingBottom:20,marginBottom:24,borderBottom:"1px solid #eee"}}>
            <div>
              <div style={{fontWeight:800,fontSize:20,fontFamily:"'Playfair Display',serif"}}>{order.id}</div>
              <div style={{color:"#666",fontSize:14}}>Commandé le {order.date} par {order.customer}</div>
              <div style={{color:"#666",fontSize:14}}>📞 {order.phone}</div>
              {pm && <div style={{marginTop:6,display:"inline-flex",alignItems:"center",gap:6,background:pm.color,color:pm.id==="mtn"?"#000":"#fff",padding:"3px 10px",borderRadius:8,fontSize:13,fontWeight:700}}>
                {pm.logo} {pm.name}
              </div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:800,fontSize:22,color:"#F4A261"}}>{fmt(order.total)}</div>
              <div style={{...s.paidPill,background:order.paid?"#e8f5e9":"#fff3e0",color:order.paid?"#2e7d32":"#e65100"}}>
                {order.paid?"✅ Payé":"⏳ En attente"}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={{marginBottom:24}}>
            {TRACKING_STEPS.map((step,i)=>{
              const done = i+1<order.status;
              const active = i+1===order.status;
              return (
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,background:done?"#2D6A4F":active?"#F4A261":"#eee",color:done||active?"#fff":"#bbb",fontWeight:700,transition:"all 0.3s",transform:active?"scale(1.15)":"scale(1)",boxShadow:active?"0 0 0 4px rgba(244,162,97,0.25)":"none"}}>
                      {done?"✓":step.icon}
                    </div>
                    {i<TRACKING_STEPS.length-1 && <div style={{width:2,height:24,background:done?"#2D6A4F":"#eee",transition:"background 0.3s"}} />}
                  </div>
                  <div style={{paddingBottom:16,paddingTop:6}}>
                    <div style={{fontWeight:active?700:400,color:active?"#2D3436":done?"#2D6A4F":"#aaa",fontSize:15}}>{step.label}</div>
                    {active && <div style={{fontSize:12,color:"#F4A261",marginTop:2}}>⟳ Statut actuel</div>}
                    {done && <div style={{fontSize:12,color:"#2D6A4F",marginTop:2}}>✓ Complété</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Products */}
          <div style={{background:"#f9f9f9",borderRadius:12,padding:16}}>
            <div style={{fontWeight:700,marginBottom:10}}>Articles commandés :</div>
            {order.products.map((p,i)=>(
              <div key={i} style={{...s.row,padding:"8px 0",borderBottom:i<order.products.length-1?"1px solid #eee":"none"}}>
                <span>{p.name} — {p.size}, {p.color} × {p.qty}</span>
                <span style={{fontWeight:700}}>{fmt(p.price*p.qty)}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:12,color:"#666",fontSize:14}}>📍 Livraison : {order.address}</div>
        </div>
      )}
    </div>
  );
}

/* ─── ADMIN ───────────────────────────────────────────────────────────────── */
function AdminLogin({ pass, setPass, onLogin }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}>
      <div style={{...s.box,textAlign:"center",maxWidth:360,padding:48}}>
        <div style={{fontSize:48,marginBottom:16}}>🔐</div>
        <h2 style={{fontFamily:"'Playfair Display',serif",marginBottom:24}}>Espace Admin IBENO</h2>
        <input style={{...s.input,marginBottom:16}} type="password" placeholder="Mot de passe" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onLogin()} />
        <PBtn onClick={onLogin}>Se connecter</PBtn>
        <p style={{color:"#aaa",fontSize:12,marginTop:12}}>Mot de passe par défaut : ibeno2024</p>
      </div>
    </div>
  );
}

function Dashboard({ products, orders, onNav }) {
  const revenue = orders.filter(o=>o.paid).reduce((s,o)=>s+o.total,0);
  const pending = orders.filter(o=>o.status<5).length;
  const byMethod = PAYMENT_METHODS.map(m=>({...m,count:orders.filter(o=>o.payMethod===m.id).length}));
  return (
    <div style={s.page}>
      <h2 style={s.pageTitle}>⚙️ Tableau de bord IBENO</h2>
      <div style={s.statGrid}>
        {[
          {icon:"👗",label:"Produits",val:products.length,sub:"en catalogue",c:"#6366f1"},
          {icon:"🛒",label:"Commandes",val:orders.length,sub:"au total",c:"#F4A261"},
          {icon:"⏳",label:"En cours",val:pending,sub:"à traiter",c:"#e53e3e"},
          {icon:"💰",label:"Revenus",val:fmt(revenue),sub:"confirmés",c:"#2D6A4F"},
        ].map(st=>(
          <div key={st.label} style={{...s.statCard,borderTop:`4px solid ${st.c}`}}>
            <div style={{fontSize:28}}>{st.icon}</div>
            <div style={{fontSize:24,fontWeight:800,color:st.c,fontFamily:"'Playfair Display',serif"}}>{st.val}</div>
            <div style={{fontWeight:600}}>{st.label}</div>
            <div style={{color:"#888",fontSize:13}}>{st.sub}</div>
          </div>
        ))}
      </div>
      <div style={{background:"#fff",borderRadius:16,padding:20,marginBottom:24,border:"1px solid #eee"}}>
        <div style={{fontWeight:700,marginBottom:16}}>💳 Répartition des paiements</div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          {byMethod.filter(m=>m.count>0).map(m=>(
            <div key={m.id} style={{background:m.color,color:m.id==="mtn"?"#000":"#fff",padding:"8px 16px",borderRadius:10,fontWeight:700,fontSize:14}}>
              {m.logo} {m.name} · {m.count} cmd
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
        <PBtn onClick={()=>onNav("admin-products")} style={{width:"auto"}}>📦 Gérer les produits</PBtn>
        <PBtn onClick={()=>onNav("admin-orders")} style={{width:"auto"}}>🛒 Gérer les commandes</PBtn>
      </div>
    </div>
  );
}

function AdminProducts({ products, onEdit, onDelete, onAdd, onBack }) {
  return (
    <div style={s.page}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <h2 style={s.pageTitle}>📦 Produits</h2>
        <div style={{display:"flex",gap:10}}>
          <SBtn onClick={onBack} style={{width:"auto"}}>← Dashboard</SBtn>
          <PBtn onClick={onAdd} style={{width:"auto"}}>+ Nouveau produit</PBtn>
        </div>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={s.table}>
          <thead>
            <tr style={{background:"#fafafa"}}>
              {["","Produit","Catégorie","Prix","Stock","Actions"].map(h=><th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {products.map(p=>(
              <tr key={p.id}>
                <td style={s.td}><span style={{fontSize:28}}>{p.image}</span></td>
                <td style={s.td}><strong>{p.name}</strong><br/><small style={{color:"#888"}}>{p.description.substring(0,35)}…</small></td>
                <td style={s.td}><span style={{background:"#e8eaf6",color:"#3949ab",padding:"3px 10px",borderRadius:100,fontSize:12,fontWeight:600}}>{p.category}</span></td>
                <td style={s.td}><strong style={{color:"#F4A261"}}>{fmt(p.price)}</strong></td>
                <td style={s.td}><span style={{color:p.stock<5?"#e53e3e":"#2D6A4F",fontWeight:700}}>{p.stock}</span></td>
                <td style={s.td}>
                  <button style={s.editBtn} onClick={()=>onEdit(p)}>✏️ Modifier</button>
                  <button style={s.delBtn} onClick={()=>onDelete(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders({ orders, onStatus, onBack }) {
  return (
    <div style={s.page}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <h2 style={s.pageTitle}>🛒 Commandes</h2>
        <SBtn onClick={onBack} style={{width:"auto"}}>← Dashboard</SBtn>
      </div>
      <div style={{overflowX:"auto"}}>
        <table style={s.table}>
          <thead>
            <tr style={{background:"#fafafa"}}>
              {["Commande","Client","Paiement","Total","Statut","Progression"].map(h=><th key={h} style={s.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {orders.map(o=>{
              const pm = PAYMENT_METHODS.find(m=>m.id===o.payMethod);
              return (
                <tr key={o.id}>
                  <td style={s.td}><strong>{o.id}</strong><br/><small style={{color:"#888"}}>{o.date}</small></td>
                  <td style={s.td}>{o.customer}<br/><small style={{color:"#888"}}>{o.phone}</small></td>
                  <td style={s.td}>
                    <span style={{background:pm.color,color:pm.id==="mtn"?"#000":"#fff",padding:"3px 10px",borderRadius:8,fontSize:12,fontWeight:700}}>
                      {pm.logo} {pm.name}
                    </span>
                    <br/><span style={{...s.paidPill,background:o.paid?"#e8f5e9":"#fff3e0",color:o.paid?"#2e7d32":"#e65100",marginTop:4}}>{o.paid?"Payé":"Impayé"}</span>
                  </td>
                  <td style={s.td}><strong style={{color:"#F4A261"}}>{fmt(o.total)}</strong></td>
                  <td style={s.td}>
                    <select style={{...s.input,padding:"6px 10px",fontSize:13}} value={o.status} onChange={e=>onStatus(o.id,parseInt(e.target.value))}>
                      {TRACKING_STEPS.map((st,i)=><option key={i} value={i+1}>{st.label}</option>)}
                    </select>
                  </td>
                  <td style={s.td}>
                    <div style={{height:6,background:"#eee",borderRadius:3,width:100,marginBottom:4}}>
                      <div style={{height:"100%",background:"#2D6A4F",borderRadius:3,width:`${(o.status/TRACKING_STEPS.length)*100}%`}} />
                    </div>
                    <small style={{color:"#888",fontSize:11}}>{TRACKING_STEPS[o.status-1]?.label}</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductForm({ product, onSave, onBack }) {
  const [form, setForm] = useState(product||{name:"",price:"",stock:"",category:"Femme",image:"👗",description:"",sizes:"S,M,L,XL",colors:"Noir,Blanc"});
  const emojis = ["👗","👔","👜","👟","👘","🎀","👖","📿","🧣","🧤","👒","🛍️","💎","👛","🩴"];
  const cats = ["Femme","Homme","Enfant","Accessoires","Chaussures","Bijoux"];
  return (
    <div style={s.page}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h2 style={s.pageTitle}>{product?"✏️ Modifier":"➕ Nouveau produit"}</h2>
        <SBtn onClick={onBack} style={{width:"auto"}}>← Retour</SBtn>
      </div>
      <div style={s.box}>
        <div style={{textAlign:"center",fontSize:60,marginBottom:12}}>{form.image}</div>
        <div style={{marginBottom:20}}>
          <label style={s.label}>Icône du produit</label>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:6}}>
            {emojis.map(e=><button key={e} style={{width:38,height:38,borderRadius:10,border:"none",cursor:"pointer",fontSize:20,background:form.image===e?"#2D3436":"#f5f5f5"}} onClick={()=>setForm(f=>({...f,image:e}))}>{e}</button>)}
          </div>
        </div>
        <div style={s.formGrid}>
          <div style={{gridColumn:"1/-1"}}><FField label="Nom du produit *" name="name" state={form} setState={setForm} placeholder="Ex: Robe Wax Élegance" /></div>
          <div>
            <label style={s.label}>Catégorie *</label>
            <select style={{...s.input,marginTop:4}} value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              {cats.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <FField label="Prix (FCFA) *" name="price" type="number" state={form} setState={setForm} placeholder="15000" />
          <FField label="Stock *" name="stock" type="number" state={form} setState={setForm} placeholder="10" />
          <FField label="Tailles (séparées par virgule)" name="sizes" state={form} setState={setForm} placeholder="S,M,L,XL" />
          <FField label="Couleurs (séparées par virgule)" name="colors" state={form} setState={setForm} placeholder="Noir,Blanc,Bleu" />
          <div style={{gridColumn:"1/-1"}}>
            <label style={s.label}>Description</label>
            <textarea style={{...s.input,height:80,resize:"vertical",marginTop:4}} placeholder="Description du produit..."
              value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} />
          </div>
        </div>
        <PBtn onClick={()=>onSave({...form,price:parseFloat(form.price),stock:parseInt(form.stock),sizes:form.sizes.split(",").map(x=>x.trim()),colors:form.colors.split(",").map(x=>x.trim())})}
          disabled={!form.name||!form.price||!form.stock}>
          {product?"✅ Enregistrer les modifications":"➕ Ajouter le produit"}
        </PBtn>
      </div>
    </div>
  );
}

/* ─── UTILS ───────────────────────────────────────────────────────────────── */
function NavBtn({ active, children, onClick }) {
  return <button style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:14,background:active?"#2D3436":"transparent",color:active?"#fff":"#555",fontFamily:"'DM Sans',sans-serif"}} onClick={onClick}>{children}</button>;
}
function PBtn({ children, onClick, disabled, style={} }) {
  return <button style={{background:"#2D3436",color:"#fff",border:"none",borderRadius:12,padding:"13px 24px",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%",marginTop:8,fontFamily:"'DM Sans',sans-serif",...style}} onClick={onClick} disabled={disabled}>{children}</button>;
}
function SBtn({ children, onClick, style={} }) {
  return <button style={{background:"#f5f5f5",color:"#333",border:"none",borderRadius:12,padding:"13px 24px",fontWeight:700,fontSize:15,cursor:"pointer",width:"100%",marginTop:8,fontFamily:"'DM Sans',sans-serif",...style}} onClick={onClick}>{children}</button>;
}
function FField({ label, name, state, setState, placeholder, type="text" }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      <input style={{...s.input,marginTop:4}} type={type} placeholder={placeholder} value={state[name]||""} onChange={e=>setState(f=>({...f,[name]:e.target.value}))} />
    </div>
  );
}

/* ─── STYLES ──────────────────────────────────────────────────────────────── */
const s = {
  app:{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:"#FAF8F5",color:"#1a1a1a"},
  nav:{background:"#fff",borderBottom:"1px solid #eee",position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,0.06)"},
  navInner:{maxWidth:1200,margin:"0 auto",padding:"0 20px",display:"flex",alignItems:"center",gap:16,height:68},
  brand:{display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginRight:"auto"},
  brandLogo:{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#2D3436,#636e72)",color:"#F4A261",fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:22,display:"flex",alignItems:"center",justifyContent:"center"},
  brandName:{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:900,lineHeight:1.1},
  brandSub:{fontSize:11,color:"#888",lineHeight:1},
  navLinks:{display:"flex",gap:6},
  cartBtn:{background:"#2D3436",color:"#fff",border:"none",borderRadius:12,padding:"10px 18px",cursor:"pointer",fontWeight:700,display:"flex",alignItems:"center",gap:8,fontSize:14,fontFamily:"'DM Sans',sans-serif"},
  cartBadge:{background:"#e53e3e",color:"#fff",borderRadius:"50%",width:20,height:20,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700},
  main:{maxWidth:1200,margin:"0 auto",padding:"28px 20px"},
  hero:{background:"linear-gradient(135deg,#1a1a1a 0%,#2D3436 50%,#3d4f50 100%)",color:"#fff",borderRadius:24,padding:"56px 40px",marginBottom:32,position:"relative",overflow:"hidden"},
  heroContent:{position:"relative",zIndex:2,maxWidth:600},
  heroBadge:{display:"inline-block",background:"rgba(244,162,97,0.2)",border:"1px solid rgba(244,162,97,0.4)",color:"#F4A261",borderRadius:100,padding:"5px 14px",fontSize:13,fontWeight:600,marginBottom:16},
  heroTitle:{fontFamily:"'Playfair Display',serif",fontSize:48,fontWeight:900,lineHeight:1.1,marginBottom:14},
  heroSub:{color:"rgba(255,255,255,0.7)",fontSize:16,marginBottom:24,lineHeight:1.6},
  heroSearch:{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.1)",borderRadius:14,padding:"12px 20px",marginBottom:20,backdropFilter:"blur(10px)",border:"1px solid rgba(255,255,255,0.15)"},
  heroInput:{background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:15,flex:1,fontFamily:"'DM Sans',sans-serif"},
  heroPay:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},
  heroDecor:{position:"absolute",top:0,right:0,bottom:0,width:"40%",opacity:0.15},
  heroEmoji:{position:"absolute",fontSize:60,top:"30%",left:"20%",animation:"pulse 3s ease-in-out infinite"},
  catBar:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:28},
  catBtn:{padding:"9px 20px",borderRadius:100,cursor:"pointer",fontWeight:600,fontSize:14,fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:20},
  card:{background:"#fff",borderRadius:18,padding:20,border:"1px solid #eee",transition:"all 0.25s",cursor:"pointer"},
  cardImg:{fontSize:52,textAlign:"center",background:"#f9f6f2",borderRadius:14,padding:"20px 0",marginBottom:14},
  cardCat:{display:"inline-block",background:"#fef3e2",color:"#c47f17",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,marginBottom:8},
  cardName:{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,marginBottom:6},
  cardDesc:{color:"#888",fontSize:13,lineHeight:1.5,marginBottom:10},
  cardColors:{display:"flex",alignItems:"center",gap:6,marginBottom:12},
  colorDot:{width:10,height:10,borderRadius:"50%",background:"#ddd",border:"1px solid #ccc"},
  cardFooter:{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12},
  price:{fontFamily:"'Playfair Display',serif",fontWeight:800,fontSize:20,color:"#2D3436"},
  stockPill:{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:100,marginTop:4,display:"inline-block"},
  addBtn:{width:"100%",background:"#2D3436",color:"#fff",border:"none",borderRadius:12,padding:12,fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"},
  modal:{background:"#fff",borderRadius:24,padding:32,maxWidth:440,width:"100%",maxHeight:"90vh",overflowY:"auto",position:"relative"},
  modalClose:{position:"absolute",top:16,right:16,background:"#f5f5f5",border:"none",borderRadius:8,width:32,height:32,cursor:"pointer",fontWeight:700,fontSize:16},
  page:{maxWidth:900,margin:"0 auto"},
  pageTitle:{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:800,marginBottom:24},
  empty:{textAlign:"center",padding:"64px 0"},
  cartLayout:{display:"grid",gridTemplateColumns:"1fr 300px",gap:24,alignItems:"start"},
  cartItem:{background:"#fff",borderRadius:14,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,border:"1px solid #eee",marginBottom:12},
  qtyCtrl:{display:"flex",alignItems:"center",gap:8},
  qtyBtn:{width:30,height:30,borderRadius:8,border:"1px solid #eee",background:"#f5f5f5",cursor:"pointer",fontWeight:700,fontSize:16,fontFamily:"'DM Sans',sans-serif"},
  remBtn:{background:"#fff0f0",color:"#e53e3e",border:"none",borderRadius:8,width:30,height:30,cursor:"pointer",fontWeight:700},
  summary:{background:"#fff",borderRadius:18,padding:24,border:"1px solid #eee",position:"sticky",top:80},
  row:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"4px 0"},
  box:{background:"#fff",borderRadius:20,padding:32,border:"1px solid #eee",maxWidth:640,margin:"0 auto"},
  formGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:12},
  label:{fontSize:13,fontWeight:600,color:"#555",display:"block"},
  input:{border:"1px solid #e0e0e0",borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",width:"100%",fontFamily:"'DM Sans',sans-serif"},
  payCard:{borderRadius:14,padding:"14px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:12,transition:"all 0.2s"},
  mobilePayBox:{background:"#f9f9f9",borderRadius:16,padding:24,textAlign:"center",marginBottom:16},
  cardPreview:{background:"linear-gradient(135deg,#2D3436,#1a1a1a)",color:"#fff",borderRadius:16,padding:"24px 28px",marginBottom:20},
  paidPill:{fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:100,display:"inline-block"},
  statGrid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:16,marginBottom:28},
  statCard:{background:"#fff",borderRadius:16,padding:20,border:"1px solid #eee",display:"flex",flexDirection:"column",gap:4},
  table:{width:"100%",borderCollapse:"collapse",background:"#fff",borderRadius:16,overflow:"hidden",border:"1px solid #eee"},
  th:{padding:"14px 16px",textAlign:"left",fontSize:13,fontWeight:700,color:"#555",borderBottom:"1px solid #eee"},
  td:{padding:"14px 16px",fontSize:14,borderBottom:"1px solid #f5f5f5",verticalAlign:"middle"},
  editBtn:{background:"#e8eaf6",color:"#3949ab",border:"none",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:600,fontSize:13,marginRight:6,fontFamily:"'DM Sans',sans-serif"},
  delBtn:{background:"#ffebee",color:"#c62828",border:"none",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"},
  sizeBtn:{padding:"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,fontFamily:"'DM Sans',sans-serif"},
  notif:{position:"fixed",top:80,right:20,color:"#fff",padding:"12px 20px",borderRadius:12,fontWeight:600,fontSize:14,zIndex:1000,boxShadow:"0 4px 20px rgba(0,0,0,0.15)"},
  footer:{background:"#1a1a1a",color:"#fff",marginTop:60,padding:"40px 20px 24px"},
  footerInner:{maxWidth:1200,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:32,flexWrap:"wrap"},
  footerBrand:{display:"flex",alignItems:"center",gap:12},
  footerPay:{},
};
