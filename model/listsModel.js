const mongoose = require("mongoose");

const ListSchema = new mongoose.Schema(
    {
        title: {type: String, required: true, unique: true},
        film:[{
            type: mongoose.Schema.Types.ObjectId,
            ref:'Film', 
            required:true,
        }],
    },
    {timestamps: true}
)
module.exports = mongoose.model('Lists', ListSchema);