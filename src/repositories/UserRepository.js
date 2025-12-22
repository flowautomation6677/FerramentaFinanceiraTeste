const { publicClient, adminClient } = require('../services/supabaseClient');
const logger = require('../services/loggerService');

// Use Admin Client for Bot operations
const supabase = adminClient || publicClient;

class UserRepository {
    async findByPhone(phone) {
        // Retorna POJO (Plain Old JavaScript Object) ou null
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .eq('whatsapp_number', phone)
            .single();

        if (error && error.code !== 'PGRST116') {
            logger.error("Repo Error (User.find)", { error });
            return null;
        }
        return data || null;
    }

    async create(phone) {
        const { data, error } = await supabase
            .from('perfis')
            .insert([{ whatsapp_number: phone }])
            .select()
            .single();

        if (error) {
            logger.error("Repo Error (User.create)", { error });
            throw new Error("Falha ao criar usuário");
        }
        return data; // POJO
    }

    async getFinancialGoal(userId) {
        const { data, error } = await supabase
            .from('perfis')
            .select('financial_goal')
            .eq('id', userId)
            .single();

        if (error) {
            logger.error("Repo Error (User.getGoal)", { error });
            return null;
        }
        return data?.financial_goal || null;
    }

    async setFinancialGoal(userId, goal) {
        const { error } = await supabase
            .from('perfis')
            .update({ financial_goal: goal })
            .eq('id', userId);

        if (error) {
            logger.error("Repo Error (User.setGoal)", { error });
            return false;
        }
        return true;
    }
}

module.exports = new UserRepository();
