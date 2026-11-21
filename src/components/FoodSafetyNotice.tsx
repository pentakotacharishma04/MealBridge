export const FOOD_SAFETY_TEXT =
  'MealBridge helps coordinate food donations and pickups. Food donors are responsible for providing accurate food handling, preparation, storage and allergen information. MealBridge does not certify food safety.';

export function FoodSafetyNotice() {
  return (
    <div className="notice" role="note">
      <strong>Food safety notice. </strong>
      {FOOD_SAFETY_TEXT}
    </div>
  );
}
