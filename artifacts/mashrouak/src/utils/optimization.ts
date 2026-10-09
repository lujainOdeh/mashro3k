const radians = (value: number) => (value * Math.PI) / 180;

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const earthKm = 6371;
  const latDiff = radians(b.lat - a.lat);
  const lngDiff = radians(b.lng - a.lng);
  const h = Math.sin(latDiff / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(lngDiff / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(h));
}

export function optimizeGroups(orders: any[], projects: any[]) {
  const eligible = orders.filter((order) => order.status === 'ready' && !order.courierId);
  const buckets: any[] = [];
  eligible.forEach((order) => {
    const project = projects.find((item) => item.id === order.projectId);
    const pickup = project?.locationCoords ?? { lat: 31.9539, lng: 35.9106 };
    let bucket = buckets.find((group) => group.projectId === order.projectId && group.orders.some((candidate: any) => haversine(candidate.address, order.address) < 4));
    if (!bucket) {
      bucket = { id: `GRP-${String(buckets.length + 1).padStart(2, '0')}`, projectId: order.projectId, pickup, orders: [] };
      buckets.push(bucket);
    }
    bucket.orders.push(order);
  });
  const groups = buckets.map((bucket) => {
    const km = bucket.orders.reduce((sum: number, order: any) => sum + haversine(bucket.pickup, order.address), 0);
    return { ...bucket, orderIds: bucket.orders.map((order: any) => order.id), distanceKm: Number(km.toFixed(1)), estimatedCost: Number((2.1 + km * 0.34).toFixed(2)), status: 'simulated' };
  });
  const before = Number(eligible.reduce((sum, order) => sum + order.deliveryFee, 0).toFixed(2));
  const after = Number(groups.reduce((sum, group) => sum + group.estimatedCost, 0).toFixed(2));
  return { groups, before, after, savings: Math.max(0, Number((before - after).toFixed(2))), eligibleCount: eligible.length };
}

export const assumptions = [
  'المسافة خط مستقيم باستخدام معادلة هافرسين، وليست مسافة طريق.',
  'تجميع الطلبات ضمن ٤ كم عند نقطة الاستلام نفسها.',
  'تكلفة العرض التوضيحي: ٢٫١٠ د.أ لكل مجموعة + ٠٫٣٤ د.أ لكل كم.',
  'لا يتضمن العرض حركة المرور أو سعة المركبة أو توجيهاً حقيقياً.',
];
