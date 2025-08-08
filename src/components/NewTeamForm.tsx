"use client";

import Link from "next/link";
import { createTeam } from "@/lib/actions/teams";
import { useActionState } from "react";

export default function InvoiceForm({
  customers,
}: {
  customers: CustomerField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const [state, formAction] = useActionState(createInvoice, initialState);

  return (
    <form action={formAction}>
      {/* Customer */}
      <div>
        <label>
          Customer&nbsp;
          <select name="customerId" defaultValue="">
            <option value="" disabled>
              Select a customer
            </option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {state.errors?.customerId?.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>

      {/* Amount */}
      <div>
        <label>
          Amount (USD)&nbsp;
          <input name="amount" type="number" step="0.01" />
        </label>
        {state.errors?.amount?.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>

      {/* Status */}
      <div>
        <label>
          <input type="radio" name="status" value="pending" /> Pending
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name="status" value="paid" /> Paid
        </label>
        {state.errors?.status?.map((e) => (
          <p key={e}>{e}</p>
        ))}
      </div>

      {/* General error / success message */}
      {state.message && <p>{state.message}</p>}

      {/* Actions */}
      <div style={{ marginTop: 16 }}>
        <Link href="/dashboard/invoices">Cancel</Link>
        <button type="submit" style={{ marginLeft: 8 }}>
          Create Invoice
        </button>
      </div>
    </form>
  );
}
