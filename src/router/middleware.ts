export async function loadLayoutMiddleware(route: any) {
  try {
    const layout = route.meta.layout.__name;

    // let layoutComponent = await import(`@/layouts/${layout}.vue`);
    // route.meta.layoutComponent = layoutComponent.default;
    // console.log(layoutComponent);
  } catch (e) {
    const layout = "AppLayout";
    const layoutComponent = await import(`@/layouts/${layout}.vue`);
    route.meta.layoutComponent = layoutComponent.default;
    console.log('catch',layoutComponent);
  }
}