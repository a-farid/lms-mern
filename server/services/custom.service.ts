export const findOneById = (one: string, gb: any) => {
  return gb.find((c: any) => String(c._id) === one);
};
