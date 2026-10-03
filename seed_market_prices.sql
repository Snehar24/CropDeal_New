-- ==========================================================
-- CropDeal Platform: Seed Market Prices & Commodity Units
-- ==========================================================

USE cropdeal_marketprice;

-- Commodity Units
INSERT IGNORE INTO commodity_units (commodity, variety, source_unit, kg_per_unit) VALUES
('Wheat', 'Sharbati', 'Rs./Quintal', 100.0),
('Wheat', 'Dara', 'Rs./Quintal', 100.0),
('Wheat', 'Kalyan', 'Rs./Quintal', 100.0),
('Rice', 'Basmati', 'Rs./Quintal', 100.0),
('Rice', 'Common', 'Rs./Quintal', 100.0),
('Onion', 'Red', 'Rs./Quintal', 100.0),
('Onion', 'White', 'Rs./Quintal', 100.0),
('Tomato', 'Hybrid', 'Rs./Quintal', 100.0),
('Tomato', 'Local', 'Rs./Quintal', 100.0),
('Potato', 'Jyoti', 'Rs./Quintal', 100.0),
('Potato', 'Desi', 'Rs./Quintal', 100.0),
('Cotton', 'Medium Staple', 'Rs./Quintal', 100.0),
('Cotton', 'Long Staple', 'Rs./Quintal', 100.0),
('Soybean', 'Yellow', 'Rs./Quintal', 100.0),
('Maize', 'Yellow', 'Rs./Quintal', 100.0),
('Mustard', 'Black', 'Rs./Quintal', 100.0),
('Sugarcane', 'Standard', 'Rs./Quintal', 100.0),
('Barley', 'Common', 'Rs./Quintal', 100.0),
('Chana', 'Desi', 'Rs./Quintal', 100.0);

-- Market Prices (arrival_date = CURRENT_DATE)
INSERT INTO market_prices (state, district, market, commodity, variety, grade, arrival_date, min_price, max_price, modal_price, source_unit, kg_per_unit, min_price_per_kg, max_price_per_kg, modal_price_per_kg) VALUES
-- Wheat in Punjab
('Punjab', 'Ludhiana', 'Ludhiana Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2200.0, 3000.0, 2600.0, 'Rs./Quintal', 100.0, 22.0, 30.0, 26.0),
('Punjab', 'Ludhiana', 'Khanna Mandi', 'Wheat', 'Dara', 'A', CURRENT_DATE, 2300.0, 3100.0, 2700.0, 'Rs./Quintal', 100.0, 23.0, 31.0, 27.0),
('Punjab', 'Amritsar', 'Amritsar Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2250.0, 3050.0, 2650.0, 'Rs./Quintal', 100.0, 22.5, 30.5, 26.5),
('Punjab', 'Patiala', 'Patiala Mandi', 'Wheat', 'Kalyan', 'A', CURRENT_DATE, 2200.0, 2950.0, 2550.0, 'Rs./Quintal', 100.0, 22.0, 29.5, 25.5),
('Punjab', 'Jalandhar', 'Jalandhar Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2250.0, 3000.0, 2600.0, 'Rs./Quintal', 100.0, 22.5, 30.0, 26.0),

-- Wheat in Haryana & UP & MP
('Haryana', 'Karnal', 'Karnal Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2250.0, 3100.0, 2650.0, 'Rs./Quintal', 100.0, 22.5, 31.0, 26.5),
('Haryana', 'Ambala', 'Ambala Mandi', 'Wheat', 'Dara', 'A', CURRENT_DATE, 2200.0, 2950.0, 2550.0, 'Rs./Quintal', 100.0, 22.0, 29.5, 25.5),
('Uttar Pradesh', 'Meerut', 'Meerut Mandi', 'Wheat', 'Dara', 'A', CURRENT_DATE, 2150.0, 2900.0, 2500.0, 'Rs./Quintal', 100.0, 21.5, 29.0, 25.0),
('Uttar Pradesh', 'Agra', 'Agra Mandi', 'Wheat', 'Dara', 'A', CURRENT_DATE, 2100.0, 2850.0, 2450.0, 'Rs./Quintal', 100.0, 21.0, 28.5, 24.5),
('Madhya Pradesh', 'Indore', 'Indore Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2400.0, 3400.0, 2900.0, 'Rs./Quintal', 100.0, 24.0, 34.0, 29.0),
('Madhya Pradesh', 'Bhopal', 'Bhopal Mandi', 'Wheat', 'Sharbati', 'A', CURRENT_DATE, 2350.0, 3300.0, 2800.0, 'Rs./Quintal', 100.0, 23.5, 33.0, 28.0),

-- Rice in Punjab, Haryana, AP, WB, TN
('Punjab', 'Ludhiana', 'Ludhiana Mandi', 'Rice', 'Basmati', 'A', CURRENT_DATE, 3000.0, 4500.0, 3800.0, 'Rs./Quintal', 100.0, 30.0, 45.0, 38.0),
('Punjab', 'Patiala', 'Patiala Mandi', 'Rice', 'Basmati', 'A', CURRENT_DATE, 3100.0, 4600.0, 3900.0, 'Rs./Quintal', 100.0, 31.0, 46.0, 39.0),
('Haryana', 'Karnal', 'Karnal Mandi', 'Rice', 'Basmati', 'A', CURRENT_DATE, 3200.0, 4800.0, 4000.0, 'Rs./Quintal', 100.0, 32.0, 48.0, 40.0),
('Andhra Pradesh', 'Krishna', 'Vijayawada Mandi', 'Rice', 'Common', 'A', CURRENT_DATE, 2200.0, 3400.0, 2800.0, 'Rs./Quintal', 100.0, 22.0, 34.0, 28.0),
('Andhra Pradesh', 'Guntur', 'Guntur Mandi', 'Rice', 'Common', 'A', CURRENT_DATE, 2150.0, 3350.0, 2750.0, 'Rs./Quintal', 100.0, 21.5, 33.5, 27.5),
('West Bengal', 'Burdwan', 'Burdwan Mandi', 'Rice', 'Common', 'A', CURRENT_DATE, 2100.0, 3200.0, 2650.0, 'Rs./Quintal', 100.0, 21.0, 32.0, 26.5),
('Tamil Nadu', 'Thanjavur', 'Thanjavur Mandi', 'Rice', 'Common', 'A', CURRENT_DATE, 2250.0, 3500.0, 2900.0, 'Rs./Quintal', 100.0, 22.5, 35.0, 29.0),

-- Onion in Maharashtra, Karnataka, Tamil Nadu
('Maharashtra', 'Nashik', 'Lasalgaon Mandi', 'Onion', 'Red', 'A', CURRENT_DATE, 1800.0, 3500.0, 2800.0, 'Rs./Quintal', 100.0, 18.0, 35.0, 28.0),
('Maharashtra', 'Pune', 'Pune APMC', 'Onion', 'Red', 'A', CURRENT_DATE, 1900.0, 3600.0, 2900.0, 'Rs./Quintal', 100.0, 19.0, 36.0, 29.0),
('Karnataka', 'Hubli', 'Hubli APMC', 'Onion', 'Red', 'A', CURRENT_DATE, 1700.0, 3300.0, 2600.0, 'Rs./Quintal', 100.0, 17.0, 33.0, 26.0),
('Tamil Nadu', 'Erode', 'Erode Market', 'Onion', 'Red', 'A', CURRENT_DATE, 2000.0, 3800.0, 3000.0, 'Rs./Quintal', 100.0, 20.0, 38.0, 30.0),
('Tamil Nadu', 'Coimbatore', 'Coimbatore APMC', 'Onion', 'Red', 'A', CURRENT_DATE, 2100.0, 3900.0, 3100.0, 'Rs./Quintal', 100.0, 21.0, 39.0, 31.0),

-- Tomato in Maharashtra, Karnataka, AP
('Maharashtra', 'Nashik', 'Nashik APMC', 'Tomato', 'Hybrid', 'A', CURRENT_DATE, 1500.0, 3000.0, 2200.0, 'Rs./Quintal', 100.0, 15.0, 30.0, 22.0),
('Karnataka', 'Kolar', 'Kolar APMC', 'Tomato', 'Hybrid', 'A', CURRENT_DATE, 1600.0, 3200.0, 2400.0, 'Rs./Quintal', 100.0, 16.0, 32.0, 24.0),
('Andhra Pradesh', 'Chittoor', 'Madanapalle Mandi', 'Tomato', 'Hybrid', 'A', CURRENT_DATE, 1400.0, 2800.0, 2100.0, 'Rs./Quintal', 100.0, 14.0, 28.0, 21.0),

-- Potato in UP, WB, Punjab
('Uttar Pradesh', 'Agra', 'Agra APMC', 'Potato', 'Jyoti', 'A', CURRENT_DATE, 1200.0, 2200.0, 1800.0, 'Rs./Quintal', 100.0, 12.0, 22.0, 18.0),
('West Bengal', 'Hooghly', 'Hooghly Mandi', 'Potato', 'Desi', 'A', CURRENT_DATE, 1100.0, 2000.0, 1600.0, 'Rs./Quintal', 100.0, 11.0, 20.0, 16.0),
('Punjab', 'Jalandhar', 'Jalandhar APMC', 'Potato', 'Jyoti', 'A', CURRENT_DATE, 1300.0, 2300.0, 1800.0, 'Rs./Quintal', 100.0, 13.0, 23.0, 18.0),

-- Cotton in Gujarat, Maharashtra, Telangana
('Gujarat', 'Rajkot', 'Rajkot APMC', 'Cotton', 'Medium Staple', 'A', CURRENT_DATE, 6500.0, 8500.0, 7500.0, 'Rs./Quintal', 100.0, 65.0, 85.0, 75.0),
('Maharashtra', 'Nagpur', 'Nagpur APMC', 'Cotton', 'Medium Staple', 'A', CURRENT_DATE, 6400.0, 8200.0, 7300.0, 'Rs./Quintal', 100.0, 64.0, 82.0, 73.0),
('Telangana', 'Warangal', 'Warangal APMC', 'Cotton', 'Long Staple', 'A', CURRENT_DATE, 6600.0, 8400.0, 7600.0, 'Rs./Quintal', 100.0, 66.0, 84.0, 76.0),

-- Soybean in MP, Maharashtra
('Madhya Pradesh', 'Indore', 'Indore Mandi', 'Soybean', 'Yellow', 'A', CURRENT_DATE, 4200.0, 5500.0, 4800.0, 'Rs./Quintal', 100.0, 42.0, 55.0, 48.0),
('Maharashtra', 'Latur', 'Latur APMC', 'Soybean', 'Yellow', 'A', CURRENT_DATE, 4100.0, 5400.0, 4750.0, 'Rs./Quintal', 100.0, 41.0, 54.0, 47.5),

-- Maize in Karnataka, Bihar, Punjab
('Karnataka', 'Davangere', 'Davangere APMC', 'Maize', 'Yellow', 'A', CURRENT_DATE, 1800.0, 2600.0, 2200.0, 'Rs./Quintal', 100.0, 18.0, 26.0, 22.0),
('Bihar', 'Purnia', 'Gulabbagh Mandi', 'Maize', 'Yellow', 'A', CURRENT_DATE, 1900.0, 2700.0, 2300.0, 'Rs./Quintal', 100.0, 19.0, 27.0, 23.0),
('Punjab', 'Ludhiana', 'Ludhiana Mandi', 'Maize', 'Yellow', 'A', CURRENT_DATE, 1850.0, 2650.0, 2250.0, 'Rs./Quintal', 100.0, 18.5, 26.5, 22.5),

-- Mustard in Rajasthan, Haryana
('Rajasthan', 'Jaipur', 'Jaipur APMC', 'Mustard', 'Black', 'A', CURRENT_DATE, 5000.0, 6200.0, 5600.0, 'Rs./Quintal', 100.0, 50.0, 62.0, 56.0),
('Haryana', 'Hisar', 'Hisar Mandi', 'Mustard', 'Black', 'A', CURRENT_DATE, 5100.0, 6300.0, 5700.0, 'Rs./Quintal', 100.0, 51.0, 63.0, 57.0),

-- Sugarcane in UP, Maharashtra
('Uttar Pradesh', 'Meerut', 'Meerut Mandi', 'Sugarcane', 'Standard', 'A', CURRENT_DATE, 350.0, 450.0, 400.0, 'Rs./Quintal', 100.0, 3.5, 4.5, 4.0),
('Maharashtra', 'Kolhapur', 'Kolhapur Mandi', 'Sugarcane', 'Standard', 'A', CURRENT_DATE, 360.0, 460.0, 410.0, 'Rs./Quintal', 100.0, 3.6, 4.6, 4.1),

-- Chana / Chickpeas in MP, Rajasthan
('Madhya Pradesh', 'Bhopal', 'Bhopal Mandi', 'Chana', 'Desi', 'A', CURRENT_DATE, 5200.0, 6500.0, 5800.0, 'Rs./Quintal', 100.0, 52.0, 65.0, 58.0),
('Rajasthan', 'Bikaner', 'Bikaner APMC', 'Chana', 'Desi', 'A', CURRENT_DATE, 5100.0, 6400.0, 5750.0, 'Rs./Quintal', 100.0, 51.0, 64.0, 57.5);
