
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  Filter,
  Mail, 
  Building2,
  Calendar,
  Settings,
  UserX
} from 'lucide-react';

const ActiveUsersTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const { data: activeUsers, isLoading } = useQuery({
    queryKey: ['active-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          units (
            id,
            name,
            code
          ),
          user_roles (
            role
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredUsers = activeUsers?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      user.user_roles?.some(ur => ur.role === roleFilter);

    return matchesSearch && matchesRole;
  });

  const handleDeactivate = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Usuário desativado',
        description: 'O usuário foi desativado com sucesso.',
      });

      queryClient.invalidateQueries({ queryKey: ['active-users'] });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível desativar o usuário.',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadge = (userRoles: any[]) => {
    if (!userRoles || userRoles.length === 0) {
      return (
        <Badge className="text-xs bg-neutral-100 text-neutral-700 border-neutral-200">
          Usuário
        </Badge>
      );
    }

    const role = userRoles[0].role;
    const colors = {
      admin: 'bg-red-100 text-red-700 border-red-200',
      moderator: 'bg-blue-100 text-blue-700 border-blue-200',
      user: 'bg-neutral-100 text-neutral-700 border-neutral-200'
    };

    const labels = {
      admin: 'Admin',
      moderator: 'Moderador',
      user: 'Usuário'
    };

    return (
      <Badge className={`text-xs ${colors[role as keyof typeof colors] || colors.user}`}>
        {labels[role as keyof typeof labels] || 'Usuário'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-400"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white/60 dark:bg-neutral-900/40 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Usuários Ativos
            </CardTitle>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              {filteredUsers?.length || 0} usuários encontrados
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-0 bg-white dark:bg-neutral-800/40 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 border-0 bg-white dark:bg-neutral-800/40 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-0 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm">
                <SelectItem value="all">Todos os papéis</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!filteredUsers || filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-lg w-fit mx-auto mb-3">
              <Users className="h-6 w-6 text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {searchTerm || roleFilter !== 'all' ? 'Nenhum usuário encontrado' : 'Nenhum usuário ativo'}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {searchTerm || roleFilter !== 'all' ? 'Tente ajustar os filtros' : 'Aguarde novos cadastros'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="p-4 bg-neutral-50/50 dark:bg-neutral-800/30 rounded-lg border border-neutral-200/50 dark:border-neutral-700/50"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="bg-neutral-100 dark:bg-neutral-800">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {user.full_name || 'Nome não informado'}
                      </h3>
                      {getRoleBadge(user.user_roles)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      )}
                      
                      {user.units && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{user.units.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {user.position && (
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                        {user.position}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-neutral-600 border-neutral-200 hover:bg-neutral-50 dark:text-neutral-400 dark:border-neutral-700 dark:hover:bg-neutral-800/40 text-xs px-3 py-1 h-8"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeactivate(user.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20 text-xs px-3 py-1 h-8"
                    >
                      <UserX className="h-3 w-3 mr-1" />
                      Desativar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveUsersTable;
