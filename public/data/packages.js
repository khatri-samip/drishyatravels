// TODO: [High/Architecture] Data duplication - this static data duplicates the SQL seed in docs/database/001_initial_schema.sql
// Both must be kept in sync manually. Once backend API is fully functional, remove this file
// and switch frontend to consume the API (with fallback to this file for graceful degradation).
const PACKAGES = {
  "everest-base-camp": {
    id: "everest-base-camp",
    title: "Everest Base Camp Trek",
    destination: "Everest Region, Nepal",
    price: "USD 1,725",
    priceDetails: "02 Pax: USD 1,725/person · 3–5 Pax: USD 1,695/person · 6–9 Pax: USD 1,635/person",
    duration: "15 days",
    difficulty: "Challenging",
    bestSeason: "Not specified in supplied package",
    heroImage: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1800&q=85",
    description: "Everest Base Camp Trekking takes you to some of the highest navigable points on Earth, through the Everest region, Sherpa settlements, monasteries and the Himalayan giants including Everest, Lhotse, Makalu, Ama Dablam and Cho Oyu.",
    highlights: [
      "Everest Base Camp at 5357m",
      "Kala Patthar viewpoint at approximately 5545m",
      "Lukla mountain flight",
      "Namche Bazaar acclimatization",
      "Tengboche Monastery",
      "Sherpa villages and Himalayan landscapes"
    ],
    itinerary: [
      ["Day 1", "Arrive to Kathmandu and Transfer to Hotel", "Panoramic arrival into Kathmandu, airport meet-and-greet, hotel transfer and briefing. Overnight at Hotel Marshyangdi."],
      ["Day 2", "Kathmandu Sightseeing", "Sightseeing at Pashupatinath, Boudhanath and Patan Durbar Square. Overnight at Hotel Marshyangdi."],
      ["Day 3", "Fly to Lukla · Trek to Phakding", "Fly to Lukla (2840m, approximately 45 minutes) and trek to Phakding (2610m, approximately 3–4 hours)."],
      ["Day 4", "Trek to Namche Bazar", "Trek from Phakding to Namche Bazar (3450m, approximately 6–7 hours), crossing suspension bridges and entering Sagarmatha National Park."],
      ["Day 5", "Acclimatization in Namche Bazar", "Explore Namche Bazar and optional hikes around Khunde, Khumjung and the Everest View Hotel."],
      ["Day 6", "Trek to Tengboche", "Trek to Tengboche (3867m, approximately 5–6 hours), with views of Everest, Lhotse, Nuptse and Ama Dablam."],
      ["Day 7", "Trek to Dingboche", "Descend through forest, cross the Imja Khola and continue to Dingboche (4410m)."],
      ["Day 8", "Rest Day in Dingboche", "Acclimatization day with options including Nangkartshang Peak, Chhukung Village or Chhukung Ri."],
      ["Day 9", "Trek to Lobuche", "Continue beneath Cholatse and Tawoche, pass the Khumbu Glacier moraine and reach Lobuche (4930m)."],
      ["Day 10", "Goraksheop · Everest Base Camp · Gorakshep", "Trek to Goraksheop (5184m), continue to Everest Base Camp (5357m) and return to Gorakshep; approximately 7–8 hours."],
      ["Day 11", "Kala Patthar · Pheriche", "Morning climb to Kala Patthar (approximately 5545m), return to Gorakshep and trek to Pheriche (4371m), approximately 7–8 hours."],
      ["Day 12", "Trek to Namche Bazar", "Mostly downhill trekking following the river, passing Tengboche and returning to Namche Bazar (3450m)."],
      ["Day 13", "Trek to Lukla", "Final trekking day following the Dudh Koshi to Lukla (2840m), with a farewell celebration in the evening."],
      ["Day 14", "Fly Back to Kathmandu", "Fly back to Kathmandu and transfer to the hotel. Free time for shopping or exploring Thamel."],
      ["Day 15", "International Departure", "Transfer to the airport for your international flight."]
    ],
    included: [
      "Lodge trek with guide, accommodation and porters (standard room on twin sharing)",
      "All meals during tea house trek only",
      "English-speaking local expert guide",
      "Porter service (2 members = 1 porter)",
      "Domestic KTM/LUK/KTM flights",
      "Sagarmatha National Park permit",
      "Khumbu Village Development Community (VDC) permit",
      "3 nights in Kathmandu hotel on twin sharing basis with breakfast",
      "Airport transfer",
      "Insurance of staff and porters",
      "Equipment and clothing of staff and porters",
      "First aid kit carried by guide"
    ],
    excluded: [
      "Nepal visa fees",
      "International flight and airport tax",
      "Lunch and dinner in Kathmandu",
      "Personal expenses such as laundry, bar bills, internet, camera/mobile recharge, hot/cold shower, extra meals and snacks",
      "Personal gear and clothing",
      "Tips for guide, porter, driver and staff",
      "Personal insurance and medical expenses",
      "Emergency evacuation or rescue expenses",
      "Any other service not mentioned in price includes"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80"
    ],
    faqs: [
      ["What is included in the Everest Base Camp package?", "The supplied package includes lodge accommodation, guide, porter, trekking meals, domestic flights, permits, Kathmandu hotel nights, airport transfers and staff support."],
      ["How long is the trek?", "The supplied itinerary is 15 days from arrival in Kathmandu through international departure."],
      ["What is the price?", "The supplied price is USD 1,725 per person for 2 pax, USD 1,695 per person for 3–5 pax, and USD 1,635 per person for 6–9 pax, on twin sharing basis."]
    ]
  },

  "mardi-trek": {
    id: "mardi-trek",
    title: "Mardi Trek",
    destination: "Mardi Himal, Nepal",
    price: "NPR 57,400",
    priceDetails: "Per person, including Government Tax",
    duration: "4 nights / 5 days",
    difficulty: "Moderate",
    bestSeason: "Not specified in supplied package",
    heroImage: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1800&q=85",
    description: "A 4-night/5-day Mardi trek from Pokhara through Deurali, Low Camp and High Camp, with an excursion toward Mardi Himal Base Camp and a descent to Badal Danda and Siding.",
    highlights: [
      "Pokhara to Kande by sharing jeep",
      "Pitan Deurali and Low Camp",
      "High Camp at approximately 3,700m",
      "Mardi Himal Base Camp excursion up to 4,500m",
      "Badal Danda and Siding",
      "Tea house accommodation and trekking meals"
    ],
    itinerary: [
      ["Day 01", "Pokhara to Deaurali", "Guide pickup from Pokhara and drive to Kande. Trek to Pitan Deurali (1925m), about 4 hours. Overnight at the lodge."],
      ["Day 02", "Deurali to Low Camp", "Trek from Pitan Deurali to Low Camp (2985m). Lunch at Forest Camp (2600m) after about four hours. Total trekking time is about 6 hours. Overnight at the lodge."],
      ["Day 03", "Low Camp to High Camp", "Trek from Low Camp to High Camp (3,700m). Enjoy views of Machhapuchhre ahead and Annapurna South to the left. Trek takes about four hours. Overnight at the lodge."],
      ["Day 04", "High Camp to Mardi to Badal Danda", "Hike to Mardi Himal Base Camp (4500m) and return to High Camp, approximately 4–5 hours round trip. Alternatively hike to a halfway viewpoint. Then trek down to Badal Danda (3210m) and overnight at a lodge."],
      ["Day 05", "Badal Danda to Pokhara", "Trek to Siding village for about 5 hours and drive back to Pokhara. An optional extra day can extend the route from Siding to Lwang via Ghalel (5–6 hours), followed by a drive to Pokhara."]
    ],
    included: [
      "Kathmandu–Pokhara by flight as per itinerary",
      "Pokhara–Kande by sharing jeep",
      "Siding–Pokhara by sharing jeep",
      "4 nights' accommodation in tea house during trek",
      "Breakfast, lunch and dinner during the trek",
      "ACAP permit and TIMS",
      "English-speaking guide during trek",
      "Applicable government tax and service charge"
    ],
    excluded: [
      "Visa fee",
      "Insurance",
      "Personal expenses",
      "Beverage, liquor and any kind of drinks",
      "Tips",
      "Extra costs from unforeseen incidents beyond control"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80"
    ],
    faqs: [
      ["How much does the Mardi Trek cost?", "The supplied price is NPR 57,400 per person including Government Tax."],
      ["Is an extra day possible?", "Yes. The supplied itinerary says the trek can be extended one more day from Siding to Lwang via Ghalel before driving back to Pokhara."]
    ]
  },

  "rani-mahal": {
    id: "rani-mahal",
    title: "The Taj of Nepal: Rani Mahal",
    destination: "Tansen · Palpa, Nepal",
    price: "NPR 11,500",
    priceDetails: "Per person",
    duration: "2 nights / 3 days",
    difficulty: "Easy",
    bestSeason: "Not specified in supplied package",
    heroImage: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1800&q=85",
    description: "Explore Tansen and Rani Mahal, the historic palace associated with Khadga Shumsher Jung Bahadur Rana and situated on the bank of the Kali Gandaki River. It is often called the Taj of Nepal.",
    highlights: [
      "Historic Tansen",
      "Rani Mahal",
      "Kali Gandaki River",
      "Scenic western Nepal drive",
      "Hotel Pauwa Palpa"
    ],
    itinerary: [
      ["Day 1", "KTM – Tansen", "Depart Kathmandu at 6:00 AM. Drive through Nagdhunga, Chitwan and the Daunne section, enter Butwal and head uphill to Tansen. Overnight at Hotel Pauwa Palpa."],
      ["Day 2", "Tansen – Rani Mahal", "Breakfast at Hotel Pauwa Palpa, then drive approximately 13 km from Tansen to Rani Mahal. Explore the palace and Kali Gandaki River, take photos/videos and return to the hotel for the night."],
      ["Day 3", "Tansen – Kathmandu", "Wake up at 8:00 AM, have breakfast, pack belongings and depart for Kathmandu by drive."]
    ],
    included: [
      "Two-way transportation",
      "Upper Mustang Restricted Area Permit (RAP)",
      "Two meals a day (Breakfast and Dinner) during the journey",
      "Applicable government taxes and service charges"
    ],
    excluded: [
      "Visa fee",
      "Insurance",
      "Beverage, liquor and any kind of drinks",
      "Tips",
      "Extra costs from unforeseen incidents beyond control"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
    ],
    faqs: [
      ["How much is the Rani Mahal package?", "The supplied price is NPR 11,500 per person."],
      ["What is Rani Mahal known as?", "The supplied description says the palace is often called the Taj of Nepal because of its resemblance to the Taj Palace of India and its riverside setting."]
    ]
  },

  "manang": {
    id: "manang",
    title: "Explore the District after Himalayas: Manang",
    destination: "Manang, Nepal",
    price: "NPR 16,500",
    priceDetails: "Per person",
    duration: "4 nights / 5 days",
    difficulty: "Moderate",
    bestSeason: "Not specified in supplied package",
    heroImage: "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1800&q=85",
    description: "A 4-night/5-day journey through Chame, Pisang and the Manang valley, including exploration around Green Lake, Blue Lake and Gangapurna.",
    highlights: [
      "Scenic Kathmandu–Chame drive",
      "Marshyangdi River and gorge",
      "Chame and Pisang",
      "Green Lake",
      "Blue Lake and Gangapurna",
      "Manang Valley landscapes"
    ],
    itinerary: [
      ["Day 1", "KTM – Chame", "Depart Kathmandu at 6:00 AM. Drive through Trishuli River, Mugling and Chitwan, then via Dumre to the Besisahar–Chame road. Continue the off-road route beside the Marshyangdi River to Chame. Overnight at Hotel New Shangrila."],
      ["Day 2", "Chame – Pisang", "Wake early for mountain views, have breakfast and drive to Pisang. Enjoy the apple farming and Manang Valley. Overnight at Hotel Himalayan Mountain Bridge and rooftop restaurant."],
      ["Day 3", "Explore Pisang", "Explore Green Lake, where the supplied itinerary describes views/reflections of Mt. Annapurna, then continue to Blue Lake and Gangapurna. Return to the hotel for dinner and overnight at Hotel Mountain Bridge and rooftop restaurant."],
      ["Day 4", "Pisang – Besisahar", "Wake early and pack by 8:00 AM. Have breakfast and drive back to Besisahar, enjoying the Marshyangdi gorge and Octopus Fall. After approximately 6 hours arrive at Hotel Baranda Restro & Events."],
      ["Day 5", "Besisahar – Kathmandu", "Wake early, have breakfast, pack belongings and depart for Kathmandu."]
    ],
    included: [
      "4 nights' accommodation during the trip",
      "All meals (Breakfast and Dinner) during the trip",
      "Applicable government tax and service charge",
      "Two-way transportation"
    ],
    excluded: [
      "Visa fee",
      "Insurance",
      "Personal expenses",
      "Beverage, liquor and any kind of drinks",
      "Tips",
      "Extra costs from unforeseen incidents beyond control"
    ],
    gallery: [
      "https://images.unsplash.com/photo-1533130061792-64b345e4a833?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1000&q=80"
    ],
    faqs: [
      ["How much is the Manang package?", "The supplied price is NPR 16,500 per person."],
      ["What is included?", "The supplied package includes four nights' accommodation, breakfast and dinner, two-way transportation, and applicable government taxes and service charges."]
    ]
  }
};

function getPackageById(id) {
  return PACKAGES[id] || null;
}

function getAllPackages() {
  return Object.values(PACKAGES);
}
