import mongoose, { set } from 'mongoose'

const dbURI:string = process.env.DB_URI || ''

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(dbURI).then((data:any) => {
            console.log(`MongoDB connected with ${data.connection.host}`);
        })
        console.log('MongoDB connected')
    } catch (error: any) {
        console.error(error.message)
        setTimeout(connectDB,5000)
    }
}

export default connectDB