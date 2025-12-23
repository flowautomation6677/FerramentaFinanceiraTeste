'use client';

import { useState, useEffect } from 'react';
import {
    Title,
    Text,
    Card,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Badge,
    TextInput,
    Icon
} from "@tremor/react";
import { Search, UserCog, User, ShieldCheck, Trash2 } from 'lucide-react';
import { createBrowserClient } from "@supabase/ssr";

export default function UsersPage() {
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // Fetch Users
    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setLoading(true);
        // Supabase RLS should allow admins to read all profiles.
        // If RLS blocks this, we need to update RLS policies.
        const { data, error } = await supabase
            .from('perfis')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching users:", error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    // Invite Logic
    const [inviteEmail, setInviteEmail] = useState("");
    const [isInviting, setIsInviting] = useState(false);

    async function handleInvite() {
        if (!inviteEmail) return alert("Digite um email");
        setIsInviting(true);
        try {
            const res = await fetch('/api/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail })
            });
            const data = await res.json();
            if (data.success) {
                alert("Convite enviado com sucesso! 🎟️");
                setInviteEmail("");
            } else {
                alert("Erro ao enviar: " + data.error);
            }
        } catch (e) {
            alert("Erro desconhecido");
        }
        setIsInviting(false);
    }

    // Filter Users
    const filteredUsers = users.filter((user) =>
        user.whatsapp_number?.toLowerCase().includes(search.toLowerCase()) ||
        user.id?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <Title className="text-white text-2xl font-bold flex items-center gap-2">
                        <UserCog className="text-indigo-500" />
                        Gestão de Usuários
                    </Title>
                    <Text className="text-slate-400">Visualize e gerencie todos os usuários cadastrados.</Text>
                </div>
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                    {/* Invite Input Group */}
                    <div className="flex gap-2">
                        <TextInput
                            placeholder="Email para convite..."
                            value={inviteEmail}
                            onValueChange={setInviteEmail}
                            className="sm:w-64"
                        />
                        <button
                            onClick={handleInvite}
                            disabled={isInviting}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
                        >
                            {isInviting ? 'Enviando...' : 'Convidar'}
                        </button>
                    </div>

                    <TextInput
                        icon={Search}
                        placeholder="Buscar por WhatsApp..."
                        value={search}
                        onValueChange={setSearch}
                        className="sm:w-64"
                    />
                </div>
            </div>

            <Card className="glass-card ring-0 overflow-hidden">
                <Table className="mt-5">
                    <TableHead>
                        <TableRow>
                            <TableHeaderCell className="text-slate-300">WhatsApp / ID</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Meta Financeira</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Role</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Data Cadastro</TableHeaderCell>
                            <TableHeaderCell className="text-slate-300">Status</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                    Carregando usuários...
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                                    Nenhum usuário encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id} className="hover:bg-white/5 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Text className="text-white font-medium">{user.whatsapp_number}</Text>
                                            <Text className="text-xs text-slate-500 font-mono">{user.email || user.id.substring(0, 8)}</Text>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-slate-300">{user.financial_goal || "Não definida"}</Text>
                                    </TableCell>
                                    <TableCell>
                                        {user.is_admin ? (
                                            <Badge icon={ShieldCheck} color="indigo">ADMIN</Badge>
                                        ) : (
                                            <Badge icon={User} color="slate">USER</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Text className="text-slate-400">
                                            {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                                        </Text>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            {/* Actions Placeholder */}
                                            <Badge size="xs" color="emerald">Ativo</Badge>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card className="glass-card ring-0 flex items-center justify-between p-4">
                    <Text className="text-slate-400">Total Usuários</Text>
                    <Title className="text-white">{users.length}</Title>
                </Card>
                <Card className="glass-card ring-0 flex items-center justify-between p-4">
                    <Text className="text-slate-400">Admins</Text>
                    <Title className="text-indigo-400">{users.filter(u => u.is_admin).length}</Title>
                </Card>
                <Card className="glass-card ring-0 flex items-center justify-between p-4">
                    <Text className="text-slate-400">Novos (Mês)</Text>
                    <Title className="text-emerald-400">
                        {users.filter(u => {
                            if (!u.created_at) return false;
                            const d = new Date(u.created_at);
                            const now = new Date();
                            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                        }).length}
                    </Title>
                </Card>
            </div>
        </div>
    );
}
