const { publicClient, adminClient } = require('../services/supabaseClient');
const logger = require('../services/loggerService');

// Use Admin Client for Bot operations to bypass RLS (Bot is trusted)
const supabase = adminClient || publicClient;

class TransactionRepository {
    async create(transactionData) {
        const { data, error } = await supabase
            .from('transacoes')
            .insert([transactionData])
            .select()
            .single();

        if (error) {
            logger.error("Repo Error (Tx.create)", { error, data: transactionData });
            throw error;
        }
        return data; // POJO
    }

    async createMany(transactionsData) {
        if (!transactionsData || transactionsData.length === 0) return [];

        const { data, error } = await supabase
            .from('transacoes')
            .insert(transactionsData)
            .select();

        if (error) {
            logger.error("Repo Error (Tx.createMany)", { error });
            throw error;
        }
        return data || [];
    }

    async findByUserAndDateRange(userId, startDate, endDate) {
        const { data, error } = await supabase
            .from('transacoes')
            .select('*')
            .eq('user_id', userId)
            .gte('data', startDate)
            .lt('data', endDate)
            .order('data', { ascending: false }); // Ordenação útil

        if (error) {
            logger.error("Repo Error (Tx.findRange)", { error });
            return [];
        }
        return data || [];
    }

    async findTopCategories(userId, startDate) {
        const { data, error } = await supabase
            .from('transacoes')
            .select('valor, categoria')
            .eq('user_id', userId)
            .eq('tipo', 'despesa')
            .gte('data', startDate);

        if (error) {
            logger.error("Repo Error (Tx.topCat)", { error });
            return [];
        }
        return data || [];
    }

    async searchSimilar(embedding) {
        const { data, error } = await supabase.rpc('match_transacoes', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 5
        });

        if (error) {
            logger.error("Repo Error (Tx.search)", { error });
            return [];
        }
        return data || [];
    }
}

module.exports = new TransactionRepository();
