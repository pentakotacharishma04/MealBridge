import { Modal } from './Modal';
import { FoodSafetyNotice } from './FoodSafetyNotice';

export type InfoKey = 'about' | 'contact' | 'safety' | 'privacy';

const TITLES: Record<InfoKey, string> = {
  about: 'About MealBridge',
  contact: 'Contact',
  safety: 'Food safety',
  privacy: 'Privacy',
};

/** Modal content for the About, Contact, Safety and Privacy links. */
export function InfoDialog({ kind, onClose }: { kind: InfoKey | null; onClose: () => void }) {
  return (
    <Modal open={kind !== null} title={kind ? TITLES[kind] : ''} onClose={onClose}>
      {kind === 'about' && (
        <>
          <p>
            MealBridge connects event caterers, restaurants, hostels and canteens that have surplus food with nearby NGOs,
            community kitchens and volunteers who collect and deliver it before it is wasted.
          </p>
          <p>This is a hackathon prototype running on fictional, synthetic data in a Hyderabad pilot area.</p>
        </>
      )}
      {kind === 'contact' && (
        <>
          <p>This demo has no live support line. For questions about the prototype, contact the hackathon team that built it.</p>
          <p className="muted small">No real phone numbers or addresses are shown in this app.</p>
        </>
      )}
      {kind === 'safety' && (
        <>
          <FoodSafetyNotice />
          <p style={{ marginTop: 16 }}>
            Donors should state preparation time, storage condition and allergens accurately. Receivers should check
            food before serving. Refrigerated food is only matched to receivers with cold storage.
          </p>
        </>
      )}
      {kind === 'privacy' && (
        <>
          <p>
            All data in this demo is fictional and is stored only in this browser (localStorage key <code>mealbridge.v1</code>).
            Nothing is sent to a server. You can export or reset the data from the Profile page at any time.
          </p>
        </>
      )}
    </Modal>
  );
}
