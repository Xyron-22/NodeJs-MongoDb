class Apifeatures {
    constructor(query, queryStr) {
        this.query = query
        this.queryStr = queryStr
    }

    filter() {
        if(this.queryStr) {
            const excludeStrings = ["sort", "limit", "page", "fields"];

            let tempQueryObject = {...this.queryStr}

            excludeStrings.forEach((el) => {
                delete tempQueryObject[el]
            })

            tempQueryObject = JSON.stringify(tempQueryObject);
            tempQueryObject = tempQueryObject.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
            const queryObject = JSON.parse(tempQueryObject);
            
            // console.log(queryObject)
            this.query = this.query.find(queryObject);
    
            return this;
        }
    }

    sort() {
        if(this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(",").join(" ")
            // console.log(sortBy)
            this.query = this.query.sort(sortBy);
            // console.log(query)
        }
        return this;
    }

    limitFields() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(",").join(" ");
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select("-__v")
        }
        return this;
    }

    paginate () {
    const page = Number(this.queryStr.page) || 1;
    const limit = Number(this.queryStr.limit) || 10;
    const skip = (page -1) * limit
    this.query = this.query.skip(skip).limit(limit)

    // const checkLastPage = async () => {
    //     if (this.queryStr.page) {
    //         const moviesCount = await this.query.countDocuments();
    //         if (skip >= moviesCount) {
    //             throw new Error("This page is not found")
    //         }
    //     }
    // }
    // checkLastPage()
    return this;
    }
}

module.exports = Apifeatures