MealBridge

Surplus food. Shortest route. Real impact.

MealBridge solves food wastage by connecting event caterers, restaurants, hostels and canteens that have surplus food with nearby NGOs, community kitchens and people who can distribute it. Volunteers help collect and deliver surplus food before it goes to waste.

This is a hackathon prototype: a complete working React + TypeScript web app, not a mockup. All data is fictional and lives in the browser.

## Features

- **Dashboard**: live meal, donation and waste-estimate stats, urgent pickups, recommended matches and recent rescue activity.
- **Quick Donate**: post surplus food (name, category, portions, pickup deadline, storage, allergens, pickup location) in one form.
- **Available Food**: browse open donations sorted by urgency (High / Medium / Low / Passed) and claim portions.
- **Smart Matches**: rule-based, explainable matching of donations to receiving NGOs. Each recommendation lists its reasons (distance, capacity, urgency, need, cold storage). It is not machine learning.
- **Pickup & Delivery**: volunteer task board with Available tasks, My active pickups and Completed tabs. Accept a pickup (yourself or a volunteer), mark food collected, mark delivery completed. Each rescue shows a Posted → Claimed → Collected → Delivered tracker and an activity timeline.
- **Impact**: meals rescued, food kg (portions × 0.45 kg sample conversion), estimated waste avoided, weekly and monthly trends, category split, 7-day activity, donor and volunteer leaderboards, and an assumptions panel.
- **Profile**: edit name, role and area; toggle which notification types are recorded; export rescue data as JSON; reset demo data (with confirmation); Safety and Privacy notes.
- **Persistence**: state is saved to `localStorage` under the key `mealbridge.v1`. Over-claiming is rejected by the store, not only by the UI.

## How to run

Requires Node.js 18+ and npm.

```bash
npm install
npm run dev      # start the dev server, then open the printed local URL
npm run build    # type-check and produce a production build in dist/
```

## Demo flow

1. **Post surplus food.** In **Quick Donate**, post 40 boxes of food with a pickup deadline of 9:30 PM today, starting from 8:45 PM (or use the Event buffet preset if it is available).
2. **See it with urgency.** Open **Available Food**. The new donation appears with its urgency band and countdown.
3. **See who should get it.** Open **Smart Matches**. Recommended NGOs are ranked, with the reasons for each recommendation.
4. **Claim 25 portions.** Claim 25 of the 40 portions for a receiver. The donation now shows 15 portions left.
5. **Volunteer accepts the pickup.** Open **Pickup & Delivery**, go to Available tasks, and click **Accept pickup**. Choose yourself or a volunteer.
6. **Follow the status.** The rescue moves through Posted → Claimed → Collected → Delivered. Use **Mark food as collected**, then **Mark delivery as completed**, and watch the timeline fill in.
7. **See the impact.** Open **Impact**. Meals, kg, waste-avoided estimate, trends and leaderboards now include the delivered portions.

Use **Profile → Data → Reset demo data** to start again.

## Limitations

- **No real accounts.** The "signed-in" user is a local profile; there is no login or access control.
- **No maps.** Locations are named areas with coordinates; distances are straight-line (haversine) estimates, not road routes.
- **Sample data only.** Donors, receivers, volunteers and areas are fictional and seeded in the app.
- **Impact figures are estimates.** One portion is counted as one meal. The 0.45 kg per portion is a sample conversion. Waste avoided is an estimate, not a verified environmental measurement.
- **No backend.** Everything runs in the browser; data is not shared between devices or users.

## Food safety disclaimer

MealBridge helps coordinate food donations and pickups. Food donors are responsible for providing accurate food handling, preparation, storage and allergen information. MealBridge does not certify food safety.
