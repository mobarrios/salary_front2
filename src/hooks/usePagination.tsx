export const usePaginate = (searchParams: { page: string; search: any; }) => {

    let page = parseInt(searchParams.page);
    let limit = 50;
    let search = searchParams.search;
    search = search ? search : '';
    page = !page || page < 1 ? 1 : page;
    const skip = (page - 1) * limit;

    return { page, search, limit, skip }

}