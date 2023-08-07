const Product = require("../models/product");
const getAllProductsStatic = async (req, res) => {
  const products = await Product.find({ price: { $gt: 30 } })
    .sort("price")
    .select("name price");
  res.status(200).json({ products, nbHits: products.length });
  //   throw new Error("testing async errors");
};

const getAllProducts = async (req, res) => {
  //Destructer request query
  const { featured, company, name, sort, fields, numericFilters } = req.query;
  //Print raw query
  //console.log(req.query);
  //#region Build queryObject from request
  const queryObject = {};
  if (name) {
    queryObject.name = { $regex: name, $options: "i" };
  }
  if (numericFilters) {
    const operatorMap = {
      ">": "$gt",
      ">=": "$gte",
      "=": "$eq",
      "<=": "$lte",
      "<": "$lt",
    };

    const regEx = /\b(>|>=|=|<=|<)\b/g;
    let filters = numericFilters.replace(
      regEx,
      (match) => `-${operatorMap[match]}-`
    );
    console.log(filters);
    const options = ["price", "rating"];
    filters = filters.split(",").forEach((item) => {
      const [field, operator, value] = item.split("-");
      if (options.includes(field)) {
        queryObject[field] = { [operator]: Number(value) };
      }
    });

    console.log(numericFilters);
  }
  if (featured) {
    queryObject.featured = featured === "true" ? true : false;
  }
  if (company) {
    queryObject.company = company;
  }
  //#endregion
  //Print queryObject
  console.log(queryObject);
  //#region Process query - part 1
  let result = Product.find(queryObject);
  if (sort) {
    const sortList = sort.split(",").join(" ");
    result = result.sort(sortList);
  } else {
    result = result.sort("createdAt");
  }
  if (fields) {
    const fieldsList = fields.split(",").join(" ");
    result = result.select(fieldsList);
  }
  //#endregion
  //#region Pagination - part 2
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  result = result.skip(skip).limit(limit);
  // 23 products / limit
  // 4 pages | 10 | 10 | 3 | *skip
  //#endregion

  //Wait for query to process
  const products = await result;
  //Respond with query results
  res.status(200).json({ products, nbHits: products.length });
};

module.exports = { getAllProductsStatic, getAllProducts };
