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

4. Prompt 

Build a complete, polished, fully functional hackathon web application from scratch called MealBridge.

TAGLINE: “Surplus food. Shortest route. Real impact.”

PROJECT PURPOSE:
MealBridge solves food wastage by connecting event caterers, restaurants, hostels and canteens that have surplus food with nearby NGOs, community kitchens and people who can distribute it. Volunteers help collect and deliver surplus food before it goes to waste.

Build this as a complete working application, not just a landing page, mockup, static UI or collection of disconnected screens. Prioritize functionality, usability, professional design, and a smooth demo experience.

1. DESIGN AND BRANDING

Create a premium, modern social-impact startup design.

Color palette:

- Forest green: #164E3B
- Deep green: #103B2F
- Warm cream: #F6EBDD
- White: #FFFFFF
- Rescue orange: #F28B44
- Muted gray for secondary text

Design requirements:

- Modern SaaS dashboard quality.
- Clean typography and consistent spacing.
- Rounded cards, subtle shadows, tasteful borders.
- Beautiful charts and data visualizations.
- Intuitive sidebar and navigation.
- Responsive desktop, tablet and mobile layouts.
- Attractive icons.
- Smooth transitions and micro-interactions.
- Proper empty states, loading states, notifications and confirmation messages.
- Avoid clutter, oversized unnecessary gradients, generic templates and unfinished sections.
- Use a consistent design system across the entire application.

2. APPLICATION STRUCTURE

Create these pages and make navigation work:

1. Landing Page
2. Dashboard
3. Available Food
4. Quick Donate
5. Smart Matches
6. Pickup & Delivery
7. Impact Dashboard
8. Profile / Settings

Create a responsive navigation system with MealBridge branding, page links, notifications and profile controls.

Use a sidebar navigation on desktop and an appropriate mobile navigation layout.

3. LANDING PAGE

Create a beautiful landing page explaining the problem and solution.

Include:

- MealBridge logo/brand identity.
- Hero heading: “Good food deserves a second chance.”
- Supporting text explaining how surplus food is rescued and delivered to people who need it.
- CTA buttons: “Donate Surplus Food” and “Find Available Food”.
- Live-looking impact statistics using sample data.
- How it works section with 3 steps:
  1. Post surplus food.
  2. Match with a nearby organization.
  3. Collect and deliver food.
- Donor, NGO and volunteer sections.
- Impact section.
- Testimonials using clearly fictional sample content.
- Footer with About, Contact, Safety and Privacy links.

All buttons should navigate to the appropriate page or perform an action.

4. MAIN DASHBOARD

Create a complete dashboard with:

- Welcome message.
- Summary cards:
  Total meals rescued.
  Active donations.
  Completed rescues.
  Food waste avoided.
- Donation activity chart.
- Recent rescue activity.
- Urgent donations that need pickup soon.
- Recommended matches.
- Quick actions: Donate Food, Find Food, Volunteer for Pickup.
- A clear overview of the entire rescue operation.

Use realistic sample data and make the dashboard visually impressive.

5. QUICK DONATE — DONOR MODULE

Create a quick donation form that can be completed in under one minute.

Fields:

- Food name.
- Food category.
- Quantity / number of meal portions.
- Food description.
- Food preparation time.
- Ready for pickup time.
- Pickup deadline.
- Storage condition (ambient, refrigerated, hot-held, etc.).
- Allergens.
- Pickup location using fictional sample locations.
- Optional notes.

Food categories:

- Cooked meals.
- Rice and grains.
- Bread and bakery.
- Fruits and vegetables.
- Packaged food.
- Other.

Features:

- Form validation.
- Easy category selection.
- Quantity controls.
- Deadline selection.
- Clear food safety information.
- Preview before posting if practical.
- Successful donation confirmation.
- Newly posted donations should immediately appear in Available Food and dashboard listings.
- Show the urgency of each donation.
- Allow donors to edit or cancel their own sample donations.

6. AVAILABLE FOOD — RECEIVER MODULE

Create a food discovery page for NGOs and community kitchens.

Show donation cards containing:

- Food name.
- Food image or attractive category illustration.
- Number of portions available.
- Approximate pickup area.
- Pickup deadline.
- Time remaining.
- Storage information.
- Allergens.
- Donor name.
- Urgency indicator.
- Claim button.

Include:

- Search.
- Filter by food category.
- Filter by distance.
- Filter by quantity.
- Filter by pickup deadline.
- Sort by nearest, most urgent and largest quantity.
- Grid and list views if practical.
- Empty state when there are no matching donations.

Receivers must be able to claim all or part of the available quantity, provided the remaining quantity and claim rules allow it.

Prevent claiming more portions than are available.

After a claim:

- Update the remaining quantity.
- Update the donation status.
- Show confirmation.
- Reflect changes across the dashboard and tracking screens.

7. SMART MATCHING ENGINE — MAIN INNOVATION

Build an explainable Smart Rescue Match system.

Match donations with receiver organizations based on:

- Distance.
- Food quantity versus receiver capacity.
- Pickup deadline and time urgency.
- Receiver's current need.
- Receiver's ability to collect or receive food.
- Food category suitability.

Create a transparent Rescue Priority Score from 0 to 100.

Use a reasonable weighted scoring system such as:

- Urgency: 35%.
- Distance: 25%.
- Quantity/capacity fit: 20%.
- Receiver need: 20%.

These weights may be adjusted to produce sensible recommendations.

Do not create a fake AI label for a simple algorithm. Clearly describe it as an explainable smart matching algorithm.

Show:

- Priority score.
- Match score.
- Recommended receiver.
- Estimated distance.
- Available capacity.
- Deadline.
- Why the receiver was matched.
- Urgency badge.
- Recommended action.

Use sorting and scoring logic that actually works with the sample data.

Create a Smart Matches page that presents the best matches and makes it easy to claim or assign a rescue.

8. PICKUP AND DELIVERY — VOLUNTEER MODULE

Create a functional volunteer pickup system.

Volunteer dashboard:

- Available pickup tasks.
- Pickup area.
- Donation details.
- Portions to collect.
- Pickup deadline.
- Destination organization.
- Distance estimate.
- Task status.

Allow volunteers to accept available pickup tasks.

Create a rescue tracking workflow with the following statuses:

POSTED → CLAIMED → COLLECTED → DELIVERED

Features:

- Status progress tracker.
- Assign volunteer.
- Accept pickup task.
- Mark food as collected.
- Mark delivery as completed.
- Confirmation feedback at each step.
- Activity timeline.
- Current status displayed across the application.

Make the workflow functional with sample data and state updates.

9. IMPACT DASHBOARD

Create a beautiful impact analytics page.

Show:

- Total meals rescued.
- Total food weight rescued in kilograms.
- Estimated food waste avoided.
- Number of completed rescues.
- Number of participating donors.
- NGOs supported.
- Volunteer contributions.
- Weekly and monthly trends.
- Food category distribution.
- Rescue activity chart.
- Leaderboard for donors and volunteers if practical.

Use transparent calculations and display the assumptions.

For example:

- One meal portion equals one meal rescued.
- Estimated food weight should use a clearly displayed sample conversion assumption.
- Waste avoided is an estimate, not a verified environmental measurement.

Impact statistics should update when a rescue is completed.

10. FOOD SAFETY AND RESPONSIBLE DESIGN

Food safety must be taken seriously.

Show the following information on donation and claim screens:

- Food preparation time.
- Pickup deadline.
- Storage conditions.
- Allergens.
- Handling instructions.

Include visible safety reminders.

The platform must never claim to certify food safety.

Clearly state:
“MealBridge helps coordinate food donations and pickups. Food donors are responsible for providing accurate food handling, preparation, storage and allergen information. MealBridge does not certify food safety.”

Expired or past-deadline donations should not be claimable.

Do not make unsupported legal, medical or tax benefit claims.

11. NOTIFICATIONS AND INTERACTIONS

Implement functional interactions throughout the application:

- Buttons.
- Navigation.
- Search.
- Filters.
- Forms.
- Claim donation.
- Quantity adjustments.
- Volunteer task acceptance.
- Status updates.
- Confirmations.
- Toast notifications.
- Tabs.
- Charts.
- Modal/dialog interactions.
- Profile menu.

Avoid buttons that do nothing.

Use local persistence where practical so refreshing the page does not erase all demo activity.

12. DEMO DATA

Use entirely synthetic data.

Create fictional:

- Event caterers.
- NGOs.
- Community kitchens.
- Volunteers.
- Donations.
- Pickup tasks.

Use sample locations from a single fictional pilot area in Hyderabad, India, and display approximate locations only. Do not use real personal details, real phone numbers or private addresses.

Populate the app with enough sample data to make every page look complete during a hackathon demo.

Create at least:

- 8 sample food donations with different categories, quantities and urgency.
- 5 receiver organizations with different capacities and needs.
- 6 volunteers.
- Several completed rescues for impact charts.
- Several active pickups.

Make sample data realistic and consistent across all pages.


13. LIVE DEMO SCENARIO

Make the application easy to demonstrate in this scenario:

An event caterer has 40 meal boxes available at 8:45 PM, with pickup required before 9:30 PM.

The system should:

1. Allow the donor to post the donation quickly.
2. Display it in Available Food immediately.
3. Calculate its urgency.
4. Recommend suitable nearby NGOs.
5. Explain why the best NGO is matched.
6. Allow an NGO to claim 25 portions.
7. Leave 15 portions available if partial claims are supported.
8. Allow a volunteer to accept pickup.
9. Update statuses from Posted to Claimed to Collected to Delivered.
10. Update the impact dashboard after successful delivery.

Ensure the demo can be performed smoothly without requiring real external accounts or services.

14. TECHNICAL REQUIREMENTS

Use the framework and tools available in the existing Codebenders environment.

Prefer a maintainable architecture with:

- Reusable components.
- Clean folder organization.
- Shared layouts.
- Consistent design tokens.
- Reusable donation cards.
- Centralized sample data.
- Proper state management.
- Functional calculations.
- Responsive styling.

If React and TypeScript are available, use them.

If a backend, database or API key is not configured, do not let the application fail. Make the complete demo work using local sample data and local persistence first.

Do not depend on paid APIs, secret API keys or external services for the core demo.

If map integration is unavailable, create a clean location and distance presentation using sample data rather than displaying a broken map.

Ensure the app can run in the existing development environment and fix build errors.

15. FINAL QUALITY CHECK

Before finishing:

- Verify all pages are created.
- Verify navigation works.
- Verify donation creation works.
- Verify donations appear in listings.
- Verify quantity claiming works.
- Verify smart matching calculations work.
- Verify volunteer pickup assignment works.
- Verify status progression works.
- Verify completed rescues update impact metrics.
- Verify filters and search work.
- Verify local persistence works where implemented.
- Verify mobile responsiveness.
- Remove broken buttons, placeholder links, unnecessary filler text and obvious bugs.
- Ensure no page is empty or unfinished.
- Ensure the application starts successfully.

Do not stop after building the landing page.

Build the entire MealBridge MVP in one coherent implementation, prioritizing a working application over unnecessary complexity.

At the end, provide a brief summary of:

1. Features implemented.
2. How to run the application.
3. Demo flow.
4. Any limitations or incomplete features.
5. The most important next improvements.

Make thoughtful design and implementation decisions independently. Do not ask me questions before starting. Begin building the application now.

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