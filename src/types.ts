export interface CardConfig {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  chipStyle: 'modern' | 'classic' | 'cyber' | 'stealth';
  logoStyle: 'none' | 'ouroboros' | 'eye' | 'geometric' | 'phoenix';
  borderStyle: 'none' | 'gold' | 'silver' | 'neon-blue';
  finishType: 'matte-obsidian' | 'brushed-carbon' | 'stardust-black';
  fontColor: 'silver-white' | 'gold' | 'matte' | 'phosphor-blue';
}

export interface CartItem {
  id: string;
  config: CardConfig;
  price: number;
}

export interface Order {
  id: string;
  config: CardConfig;
  orderedAt: string;
  trackingNumber: string;
  status: 'Engraving' | 'Quality Check' | 'Shipped' | 'Delivered';
  shippingDetails: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}
