import { SiteNav } from "../components/SiteNav";
import { SiteFooter } from "../components/SiteFooter";
import { DraftNotice } from "../components/DraftNotice";

export default function CancellationRefundPolicyPage() {
  return (
    <main>
      <SiteNav />
      <section className="shell doc-page">
        <span className="kicker">LEGAL</span>
        <h1>Cancellation &amp; refund policy</h1>
        <DraftNotice />

        <h2>Current pilot status</h2>
        <p>SafeMY does not process online payments during the Klang Valley pilot. Any deposit, fee or payment arrangement for a protection assignment is made directly between you and the licensed agency assigned to your request — not through SafeMY. Ask the agency for their cancellation and payment terms before confirming.</p>

        <h2>Cancelling a request submitted through SafeMY</h2>
        <p>You can cancel a pending request at any time before it is accepted by contacting us — since no agency has been confirmed yet, this carries no charge from SafeMY.</p>

        <h2>What changes once in-platform payments launch</h2>
        <p>Once SafeMY begins processing payments directly, we will publish specific cancellation windows and refund terms here before that feature goes live, including how far in advance you can cancel without a fee and how any agency-set late-cancellation charges are handled.</p>

        <h2>Disputes</h2>
        <p>If you have a dispute about a completed assignment, contact us via our <a href="/contact">contact page</a> and we will help coordinate with the assigned agency.</p>
      </section>
      <SiteFooter />
    </main>
  );
}
