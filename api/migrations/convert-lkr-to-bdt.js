import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Configuration
const CONVERSION_RATE = 0.50; // 1 LKR = 0.50 BDT
const TARGET_CURRENCY = 'BDT';
const SOURCE_CURRENCY = 'LKR';

// Define Schemas (Simplified for migration)
const foodCategorySchema = new mongoose.Schema({
    price: Number,
    currency: String,
    originalPrice: Number,
    originalCurrency: String,
    convertedAt: Date
}, { strict: false });

const paymentSchema = new mongoose.Schema({
    totalPrice: Number,
    cartItems: Array,
    currency: String,
    originalTotalPrice: Number,
    originalCurrency: String,
    conversionRate: Number,
    convertedAt: Date
}, { strict: false });

const FoodItem = mongoose.model('FoodItem', foodCategorySchema);
const Payment = mongoose.model('Payment', paymentSchema);

const migrate = async () => {
    try {
        if (!process.env.MONGO) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDB.');

        console.log('Starting migration: LKR -> BDT');
        console.log(`Conversion Rate: ${CONVERSION_RATE}`);

        // --- Migrate FoodItems ---
        console.log('\n--- Migrating FoodItems ---');
        const foodItems = await FoodItem.find({ currency: { $ne: TARGET_CURRENCY } });
        console.log(`Found ${foodItems.length} FoodItems to migrate.`);

        let foodUpdatedCount = 0;
        for (const item of foodItems) {
            // Check if already migrated (field check)
            if (item.currency === TARGET_CURRENCY) continue;

            const oldPrice = item.price;
            const newPrice = oldPrice * CONVERSION_RATE;

            await FoodItem.updateOne(
                { _id: item._id },
                {
                    $set: {
                        price: newPrice,
                        currency: TARGET_CURRENCY,
                        originalPrice: oldPrice,
                        originalCurrency: SOURCE_CURRENCY,
                        convertedAt: new Date()
                    }
                }
            );
            foodUpdatedCount++;
            process.stdout.write('.');
        }
        console.log(`\nFoodItems Migrated: ${foodUpdatedCount}`);

        // --- Migrate Payments ---
        console.log('\n--- Migrating Payments ---');
        const payments = await Payment.find({ currency: { $ne: TARGET_CURRENCY } });
        console.log(`Found ${payments.length} Payments to migrate.`);

        let paymentUpdatedCount = 0;
        for (const payment of payments) {
             // Check if already migrated
             if (payment.currency === TARGET_CURRENCY) continue;

            const oldTotalPrice = payment.totalPrice;
            const newTotalPrice = oldTotalPrice * CONVERSION_RATE;

            // Update cart items prices
            const newCartItems = payment.cartItems.map(item => {
                if(item.price) {
                     return {
                        ...item,
                        price: item.price * CONVERSION_RATE,
                        originalPrice: item.price
                     }
                }
                return item;
            });

            await Payment.updateOne(
                { _id: payment._id },
                {
                    $set: {
                        totalPrice: newTotalPrice,
                        cartItems: newCartItems,
                        currency: TARGET_CURRENCY,
                        originalTotalPrice: oldTotalPrice,
                        originalCurrency: SOURCE_CURRENCY,
                        conversionRate: CONVERSION_RATE,
                        convertedAt: new Date()
                    }
                }
            );
            paymentUpdatedCount++;
            process.stdout.write('.');
        }
        console.log(`\nPayments Migrated: ${paymentUpdatedCount}`);

        console.log('\nMigration Complete!');
        process.exit(0);

    } catch (error) {
        console.error('\nMigration Failed:', error);
        process.exit(1);
    }
};

const rollback = async () => {
     try {
        if (!process.env.MONGO) {
            throw new Error('MONGO_URI is not defined in .env');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO);
        console.log('Connected to MongoDB.');

        console.log('Starting ROLLBACK: BDT -> LKR');
        
        // --- Rollback FoodItems ---
        console.log('\n--- Rolling back FoodItems ---');
        const foodItems = await FoodItem.find({ currency: TARGET_CURRENCY });
        
        for (const item of foodItems) {
             if (item.originalPrice) {
                 await FoodItem.updateOne(
                    { _id: item._id },
                    {
                        $set: {
                            price: item.originalPrice,
                            currency: SOURCE_CURRENCY
                        },
                        $unset: {
                            originalPrice: "",
                            originalCurrency: "",
                            convertedAt: ""
                        }
                    }
                );
             }
        }
        console.log('FoodItems Rollback Complete.');

        // --- Rollback Payments ---
         console.log('\n--- Rolling back Payments ---');
        const payments = await Payment.find({ currency: TARGET_CURRENCY });

        for (const payment of payments) {
            if (payment.originalTotalPrice) {
                 // Revert cart items
                const oldCartItems = payment.cartItems.map(item => {
                    const originalPrice = item.originalPrice || (item.price / CONVERSION_RATE);
                    const { originalPrice: _, ...rest } = item; // remove originalPrice field
                    return {
                        ...rest,
                        price: originalPrice
                    };
                });

                await Payment.updateOne(
                    { _id: payment._id },
                    {
                         $set: {
                            totalPrice: payment.originalTotalPrice,
                            cartItems: oldCartItems,
                            currency: SOURCE_CURRENCY
                        },
                        $unset: {
                            originalTotalPrice: "",
                            originalCurrency: "",
                            conversionRate: "",
                            convertedAt: ""
                        }
                    }
                );
            }
        }
         console.log('Payments Rollback Complete.');

        console.log('\nRollback Complete!');
        process.exit(0);

     } catch (error) {
        console.error('\nRollback Failed:', error);
        process.exit(1);
    }
}

// Check for arguments
const args = process.argv.slice(2);
if (args.includes('--rollback')) {
    rollback();
} else {
    migrate();
}
