import mongoose from "mongoose";
import bcrypt from "bcrypt"
import jsonwebtoken from "jsonwebtoken"
const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  fullName:{
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    unique: true
  },
  watchHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
  }],
  avatar: {
    type: String,
    required: true
  },
  coverImage: {
    type: String
  },
  refreshToken: {
    type: String
  }
  
},{Timestamp: true});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
  }
  next(); 
});


userSchema.methods.isPasswordCorrect = async function (password) {
 return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = async function () {
 
  return await  jsonwebtoken.sign({
    _id: this._id,
    
  },
  process.env.ACCESS_TOKEN_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  )
};
userSchema.methods.generateRefreshToken = async function () {
 
 return  await jsonwebtoken.sign({
  _id: this._id,
  
},
process.env.REFRESH_TOKEN_SECRET,
{expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
)
};
const User = mongoose.model("User", userSchema);
export default User;