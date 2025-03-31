import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    channel:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    }, {
        Timestamp: true
    }
);

 export const Subscription = mongoose.model("Subscription", subscriptionSchema);
