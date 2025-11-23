import { useState } from 'react'

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CartModal from './components/CartModal'
import Login from './components/Login'
import Licencias from './components/Licencias'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [carritoVaciado, setCarritoVaciado] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const handleCarritoVaciado = () => {
    setCarritoVaciado(true);
    setTimeout(() => setCarritoVaciado(false), 100);
};

  return (
    <>    
    <Navbar searchQuery={searchQuery} 
      setSearchQuery={setSearchQuery}
      onUserClick={() => setShowLogin(true)}  // Función para abrir modal de login
      onCartClick={() => setIsCartOpen(true)} 
    />
    <Licencias searchQuery={searchQuery}
      carritoVaciado={carritoVaciado}
    />
    {isCartOpen && (
        <CartModal
          isOpen={isCartOpen}
          onCarritoVaciado={handleCarritoVaciado}
          onClose={() => setIsCartOpen(false)}
        />
      )}
    {/* Modal de Login/Register */}
      {showLogin && (
        <Login onClose={() => setShowLogin(false)} /> // Función para cerrar modal
      )}
    <Footer />
    </>
  )
}

export default App
