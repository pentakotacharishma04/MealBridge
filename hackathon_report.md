MealBridge

Surplus Food. Shortest Route. Real Impact.

Hackathon Project Submission



1. Problem Statement

Society & Environment — Rescue the Surplus

Every day, events, caterers, restaurants, and gatherings produce surplus food that often goes to waste. At the same time, NGOs, community kitchens, and people in need may struggle to access meals.

The problem is not always a lack of food, but the lack of coordination between those who have surplus food and those who can distribute it before it goes to waste.

2. Our Solution

MealBridge is a surplus food rescue platform that connects food donors, food receivers, and volunteers to make food redistribution faster and easier.

It allows donors to post surplus food, receivers to claim the quantity they need, and volunteers to manage pickups and deliveries. The platform also tracks rescued meals and estimated environmental impact.

Our goal is to turn surplus food into an opportunity to help communities instead of letting it go to waste.

3. Target Users

- Food Donors: Event caterers, restaurants, function halls, and organizers with surplus food.
- Food Receivers: NGOs, community kitchens, shelters, and food support organizations.
- Volunteers: People willing to collect and deliver surplus food.

4. Key Features

Quick Donate

Donors can quickly post surplus food with quantity, food category, preparation time, pickup deadline, storage information, allergens, and pickup location.

Available Food

Receivers can explore available donations, search and filter food, and claim all or part of a donation.

Partial Claiming

A receiver can claim only the quantity needed, leaving the remaining food available for others.

Smart Matches

MealBridge prioritizes potential rescue matches using urgency, distance, quantity/capacity, receiver needs, and eligibility checks. Matching factors are presented to help explain recommendations.

Pickup & Delivery Tracking

The rescue process tracks pickup and delivery progress through statuses such as Posted, Claimed, Collected, and Delivered.

Impact Dashboard

The dashboard tracks rescued meal portions, estimated food weight, and impact statistics to demonstrate the value of food rescue.

Food Handling Information

The application provides food handling information and reminders. It does not certify food safety or guarantee that donated food is safe for consumption.

5. Technology Used

- React
- TypeScript
- Vite
- CSS
- Browser LocalStorage for demo persistence
- Git & GitHub for source control
- Vercel for deployment

6. Development Using CodeBenders

The application was developed using CodeBenders as the required development platform. The project was developed iteratively, with its features, pages, application logic, and workflows brought together into a working application.

Development Iterations

Iteration 1 — Application foundation

- Created the MealBridge project structure.
- Established the visual theme and responsive layout.
- Created the navigation and main application pages.

Iteration 2 — Food donation

- Implemented Quick Donate.
- Added donation categories, quantities, pickup deadlines, storage details, and donation validation.

Iteration 3 — Food discovery and claiming

- Created the Available Food page.
- Added filtering and searching.
- Implemented partial quantity claims.

Iteration 4 — Smart Matching

- Added rescue prioritization logic.
- Included urgency, distance, capacity, receiver need, and eligibility factors.

Iteration 5 — Pickup and Delivery

- Implemented pickup management and volunteer workflow.
- Added pickup status progression and rescue tracking.

Iteration 6 — Impact Dashboard

- Added meal rescue metrics.
- Included estimated food weight and visual impact information.

Iteration 7 — Build and debugging

- Installed project dependencies.
- Fixed the local Node/npm terminal environment issue.
- Ran the production build and checked the application routes.
- Started the development server and tested the primary interactive flow.

Iteration 8 — GitHub and deployment

- Initialized Git and committed the source code.
- Uploaded the repository to GitHub.
- Deployed the application using Vercel.

Note: These iteration summaries describe the development stages. The exact original CodeBenders prompts should be copied from the actual CodeBenders history if the organizers require prompt-by-prompt evidence.

7. Testing Performed

The primary donation and rescue workflow was manually tested in the local application.

Test| Expected result| Outcome
Post donation| 40 meal boxes added| Passed
Partial claim| Claim 25 out of 40| Passed
Remaining food| 15 portions remain| Passed
Pickup acceptance| Pickup accepted| Passed
Collection| Status updated| Passed
Delivery| Rescue marked delivered| Passed
Impact dashboard| Rescued meal metrics updated| Passed
Production build| Build completes successfully| Passed

The live application has been deployed. Final verification of the same interactive workflow on the public URL is still recommended.

8. Demo Scenario

A caterer has 40 surplus meal boxes after an event.

1. The caterer posts 40 meal boxes on MealBridge.
2. A community receiver claims 25 portions.
3. The system leaves 15 portions available for other receivers.
4. A volunteer accepts the pickup.
5. The food is collected and delivered.
6. The Impact Dashboard reflects the delivered portions.

This scenario demonstrates donation, partial claiming, rescue coordination, delivery tracking, and impact measurement in one simple flow.

9. Impact

MealBridge aims to:

- Reduce avoidable food waste.
- Connect surplus food to organizations that can use it.
- Make food rescue coordination easier.
- Encourage volunteer participation.
- Make the impact of food redistribution visible.

Impact metrics are estimates for demonstration purposes and are not independently verified environmental measurements.

10. Future Improvements

- Real-time donor and receiver location maps.
- Backend database and secure authentication.
- Notifications for urgent donations and pickup deadlines.
- NGO and volunteer verification.
- Real-time distance and route optimization.
- Food donation history and analytics.
- Stronger food safety guidance and operational safeguards.

11. Project Links

Live Application:
https://meal-bridge-beryl.vercel.app

GitHub Repository:
https://github.com/pentakotacharishma04/MealBridge

12. Conclusion

MealBridge bridges the gap between surplus food and people who need it. By combining quick donations, partial claims, smart matching, pickup coordination, and impact tracking, it demonstrates a practical way to make food rescue more organized, accessible, and impactful.

Surplus food. Shortest route. Real impact.