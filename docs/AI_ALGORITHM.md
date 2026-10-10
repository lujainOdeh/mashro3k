# AI and Optimization Algorithm

## Is AI implemented?

No AI model, machine-learning inference service, or AI API integration is implemented in the current repository. The user interface calls its delivery screen “smart delivery,” but the actual logic is a deterministic, client-side distance-grouping heuristic. The UI itself describes it as a simulation and does not claim AI-powered routing.

## Implemented heuristic

Implementation: `artifacts/mashrouak/src/utils/optimization.ts`, function `optimizeGroups(orders, projects)`. The merchant smart-delivery page invokes it with the current browser-state orders and projects.

### Inputs

- `orders`: demo order records including status, `courierId`, delivery fee, delivery address coordinates, and project ID.
- `projects`: demo project records, optionally with pickup coordinates.

### Steps

1. Keep orders whose status is `ready` and that have no assigned courier.
2. Visit eligible orders in their input order. For each, search existing buckets for the same project where at least one existing order is less than 4 km away by Haversine distance from the current order. Add it to the first matching bucket; otherwise create a new bucket for that project.
3. Use the project's pickup coordinates, or fallback coordinates `{ lat: 31.9539, lng: 35.9106 }` when missing.
4. For each bucket, sum straight-line pickup-to-delivery distances for its orders. Round `distanceKm` to one decimal place.
5. Estimate group cost as `2.1 + 0.34 * summedDistanceKm`, rounded to two decimals.
6. Compute `before` as the sum of eligible orders' delivery fees, `after` as the sum of group estimates, and `savings` as `max(0, before - after)`, all rounded to two decimals.

The Haversine calculation uses Earth radius `6371 km`.

### Output

`optimizeGroups` returns:

```text
{
  groups,          // simulated groups, with generated IDs, project, pickup,
                   // included orders/order IDs, distance, estimated cost
  before,          // eligible orders' current delivery-fee total
  after,           // estimated group-cost total
  savings,         // non-negative estimated difference
  eligibleCount    // number of ready, unassigned orders
}
```

The page saves `groups` in shared browser state and assigns each included order its generated `groupId`. Results disappear if demo state is reset.

## Assumptions and limitations

- Four-kilometer grouping is based on straight-line distance between order addresses, not roads.
- Groups are partitioned by project, but matching checks proximity to any order already in the bucket; this is not a route-ordering or clustering optimization guarantee.
- Cost constants are demonstration assumptions: 2.10 JOD per group plus 0.34 JOD per summed kilometer.
- The model does not account for travel networks, traffic, vehicle capacity, timing, courier position, multi-stop route order, actual provider pricing, or operational constraints.
- `savings` is clamped at zero, so a cost estimate above existing delivery fees is not exposed as a negative “saving.”
- Coordinates, fees, and outputs are demo data/estimates, not a dispatch recommendation.

The UI also uses Haversine distance to sort available courier requests. This is likewise approximate and not road distance.
