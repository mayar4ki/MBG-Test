export type TickerHistoryPoint = {
  time: string;
  price: number;
};

export type Ticker = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  previousClose: number;
  volume: number;
  dayRange: [number, number];
  week52Range: [number, number];
  history: TickerHistoryPoint[];
};

const formatTime = (date: Date) =>
  date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

const createHistory = (basePrice: number) => {
  const now = Date.now();
  return Array.from({ length: 24 }).map((_, index) => {
    const timestamp = new Date(now - (23 - index) * 5 * 60 * 1000);
    const wave = Math.sin(index / 3) * basePrice * 0.003;
    const noise = (Math.random() - 0.5) * basePrice * 0.002;
    const price = Number((basePrice + wave + noise).toFixed(2));
    return { time: formatTime(timestamp), price };
  });
};

const makeTicker = ({
  symbol,
  name,
  sector,
  price,
  previousClose,
  volume,
  dayRange,
  week52Range,
}: Omit<Ticker, 'history'>): Ticker => ({
  symbol,
  name,
  sector,
  price,
  previousClose,
  volume,
  dayRange,
  week52Range,
  history: createHistory(price),
});

export const mockTickers: Ticker[] = [
  makeTicker({
    symbol: 'AAPL',
    name: 'Apple',
    sector: 'Equities · Technology',
    price: 189.32,
    previousClose: 187.54,
    volume: 61234000,
    dayRange: [186.7, 190.8],
    week52Range: [164.8, 199.6],
  }),
  makeTicker({
    symbol: 'MSFT',
    name: 'Microsoft',
    sector: 'Equities · Technology',
    price: 417.86,
    previousClose: 414.72,
    volume: 28543000,
    dayRange: [411.1, 421.3],
    week52Range: [309.1, 430.3],
  }),
  makeTicker({
    symbol: 'NVDA',
    name: 'NVIDIA',
    sector: 'Equities · Semiconductors',
    price: 108.22,
    previousClose: 106.91,
    volume: 54239000,
    dayRange: [105.2, 110.6],
    week52Range: [68.4, 112.8],
  }),
  makeTicker({
    symbol: 'TSLA',
    name: 'Tesla',
    sector: 'Equities · Automotive',
    price: 195.44,
    previousClose: 193.32,
    volume: 98765000,
    dayRange: [191.1, 199.2],
    week52Range: [152.8, 261.7],
  }),
  makeTicker({
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    sector: 'Crypto · Layer 1',
    price: 67250.11,
    previousClose: 66804.22,
    volume: 28500000000,
    dayRange: [65980.5, 67880.3],
    week52Range: [25870.2, 73820.4],
  }),
  makeTicker({
    symbol: 'ETH-USD',
    name: 'Ethereum',
    sector: 'Crypto · Layer 1',
    price: 3325.78,
    previousClose: 3298.05,
    volume: 14230000000,
    dayRange: [3256.2, 3368.5],
    week52Range: [1564.9, 3698.8],
  }),
];
