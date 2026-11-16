'use strict';

const { Contract } = require('fabric-contract-api');

class LandContract extends Contract {
    constructor() {
        super('LandContract');
    }

    /**
     * Initialize ledger with sample land record (optional setup)
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        const genesisLand = {
            landId: 'LAND-KA-2024-001',
            surveyNumber: 'SY-104/2B',
            currentOwner: {
                name: 'Aarav Sharma',
                email: 'citizen@landchain.gov.in'
            },
            location: 'Whitefield Tech Enclave, Sector 4',
            district: 'Bengaluru Urban',
            state: 'Karnataka',
            area: 2400,
            areaUnit: 'Sq Ft',
            landType: 'Residential',
            documentRef: 'REG-DOC-KA-2024-8849',
            status: 'REGISTERED',
            registeredAt: new Date('2024-01-15T10:00:00Z').toISOString(),
            updatedAt: new Date('2024-01-15T10:00:00Z').toISOString(),
            txId: ctx.stub.getTxID() || 'genesis-tx-00000000000000000000000000000001'
        };

        await ctx.stub.putState(genesisLand.landId, Buffer.from(JSON.stringify(genesisLand)));
        console.info('============= END : Initialize Ledger ===========');
        return JSON.stringify(genesisLand);
    }

    /**
     * Check if a land record exists
     */
    async landExists(ctx, landId) {
        const buffer = await ctx.stub.getState(landId);
        return !!buffer && buffer.length > 0;
    }

    /**
     * Register a new land property on the blockchain
     */
    async registerLand(ctx, landId, surveyNumber, ownerName, ownerEmail, location, district, state, area, areaUnit, landType, documentRef) {
        console.info(`============= START : Register Land ${landId} ===========`);

        const exists = await this.landExists(ctx, landId);
        if (exists) {
            throw new Error(`Land record with ID "${landId}" already exists on the blockchain.`);
        }

        const txTimestamp = ctx.stub.getTxTimestamp();
        let timestampIso;
        if (txTimestamp && txTimestamp.seconds) {
            const milliseconds = (txTimestamp.seconds.low || txTimestamp.seconds) * 1000;
            timestampIso = new Date(milliseconds).toISOString();
        } else {
            timestampIso = new Date().toISOString();
        }

        const txId = ctx.stub.getTxID();

        const landRecord = {
            landId: landId.trim(),
            surveyNumber: surveyNumber.trim(),
            currentOwner: {
                name: ownerName.trim(),
                email: ownerEmail.trim().toLowerCase()
            },
            location: location.trim(),
            district: district.trim(),
            state: state.trim(),
            area: Number(area),
            areaUnit: areaUnit.trim(),
            landType: landType.trim(),
            documentRef: documentRef.trim(),
            status: 'REGISTERED',
            registeredAt: timestampIso,
            updatedAt: timestampIso,
            txId: txId
        };

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(landRecord)));
        console.info(`============= END : Register Land ${landId} ===========`);
        return JSON.stringify(landRecord);
    }

    /**
     * Retrieve a land record by ID from the ledger
     */
    async getLand(ctx, landId) {
        const buffer = await ctx.stub.getState(landId);
        if (!buffer || buffer.length === 0) {
            throw new Error(`Land record "${landId}" does not exist on the ledger.`);
        }
        return buffer.toString('utf8');
    }

    /**
     * Transfer land ownership to a new citizen
     */
    async transferLand(ctx, landId, newOwnerName, newOwnerEmail) {
        console.info(`============= START : Transfer Land ${landId} ===========`);

        const landAsBytes = await ctx.stub.getState(landId);
        if (!landAsBytes || landAsBytes.length === 0) {
            throw new Error(`Land record "${landId}" does not exist on the ledger.`);
        }

        const landRecord = JSON.parse(landAsBytes.toString('utf8'));
        const previousOwner = { ...landRecord.currentOwner };

        const txTimestamp = ctx.stub.getTxTimestamp();
        let timestampIso;
        if (txTimestamp && txTimestamp.seconds) {
            const milliseconds = (txTimestamp.seconds.low || txTimestamp.seconds) * 1000;
            timestampIso = new Date(milliseconds).toISOString();
        } else {
            timestampIso = new Date().toISOString();
        }

        const txId = ctx.stub.getTxID();

        // Update current ownership
        landRecord.currentOwner = {
            name: newOwnerName.trim(),
            email: newOwnerEmail.trim().toLowerCase()
        };
        landRecord.previousOwner = previousOwner;
        landRecord.updatedAt = timestampIso;
        landRecord.txId = txId;

        await ctx.stub.putState(landId, Buffer.from(JSON.stringify(landRecord)));
        console.info(`============= END : Transfer Land ${landId} to ${newOwnerEmail} ===========`);
        return JSON.stringify(landRecord);
    }

    /**
     * Retrieve complete ownership history of a property
     */
    async getLandHistory(ctx, landId) {
        console.info(`============= START : Get Land History for ${landId} ===========`);

        const iterator = await ctx.stub.getHistoryForKey(landId);
        const allHistory = [];

        while (true) {
            const res = await iterator.next();

            if (res.value) {
                const txId = res.value.txId;
                let timestamp = null;
                if (res.value.timestamp && res.value.timestamp.seconds) {
                    const millis = (res.value.timestamp.seconds.low || res.value.timestamp.seconds) * 1000;
                    timestamp = new Date(millis).toISOString();
                }

                const isDelete = res.value.isDelete;
                let record = null;
                try {
                    record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    record = res.value.value.toString('utf8');
                }

                allHistory.push({
                    txId: txId,
                    timestamp: timestamp,
                    isDelete: isDelete,
                    record: record
                });
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        console.info(`============= END : Get Land History for ${landId} ===========`);
        return JSON.stringify(allHistory);
    }

    /**
     * Retrieve all registered lands from the ledger
     */
    async getAllLands(ctx) {
        console.info('============= START : Get All Lands ===========');
        const iterator = await ctx.stub.getStateByRange('', '');
        const allResults = [];

        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                const jsonStr = res.value.value.toString('utf8');
                let record;
                try {
                    record = JSON.parse(jsonStr);
                } catch (err) {
                    record = jsonStr;
                }
                allResults.push(record);
            }

            if (res.done) {
                await iterator.close();
                break;
            }
        }

        console.info('============= END : Get All Lands ===========');
        return JSON.stringify(allResults);
    }
}

module.exports = LandContract;

