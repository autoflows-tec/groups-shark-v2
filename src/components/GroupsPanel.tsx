import { useEffect, useState } from "react";
import { Database } from "@/integrations/supabase/types";
import SharkLogo from "./SharkLogo";
import { Loader2, AlertCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGroups } from "@/hooks/useGroups";
import { getStatusType } from "@/utils/groupUtils";
import { GroupsHeader } from "./GroupsHeader";
import { GroupsSearch, ManagementFilters } from "./GroupsSearch";
import { GroupsStatusSummary } from "./GroupsStatusSummary";
import { GroupsTable } from "./GroupsTable";
import { GroupsPagination } from "./GroupsPagination";

type Group = Database['public']['Tables']['Lista_de_Grupos']['Row'];
type StatusFilter = 'todos' | 'estavel' | 'alerta' | 'critico' | 'sem-mensagens';

const GroupsPanel = () => {
  const { groups, loading, error, refreshing, handleRefresh, updateGroupField, clearGroupStatus } = useGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [managementFilters, setManagementFilters] = useState<ManagementFilters>({
    squad: '',
    head: '',
    gestor: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filtrar grupos baseado na busca, status e filtros de gestão
  const filteredGroups = groups.filter(group => {
    // Filtro por nome
    const matchesSearch = (group.nome_grupo || group.grupo || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filtro por status
    const groupStatusType = getStatusType(group.status, group.resumo, group.total_mensagens);
    const matchesStatus = statusFilter === 'todos' || groupStatusType === statusFilter;
    
    // Filtros de gestão
    const matchesSquad = !managementFilters.squad || group.squad === managementFilters.squad;
    const matchesHead = !managementFilters.head || group.head === managementFilters.head;
    const matchesGestor = !managementFilters.gestor || group.gestor === managementFilters.gestor;
    
    return matchesSearch && matchesStatus && matchesSquad && matchesHead && matchesGestor;
  });

  // Calcular paginação
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  // Reset da página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, managementFilters]);

  const getStatusSummary = () => {
    let estavel = 0, alerta = 0, critico = 0;
    
    filteredGroups.forEach(group => {
      const statusType = getStatusType(group.status, group.resumo, group.total_mensagens);
      switch (statusType) {
        case 'estavel':
          estavel++;
          break;
        case 'alerta':
          alerta++;
          break;
        case 'critico':
          critico++;
          break;
      }
    });
    
    return { estavel, alerta, critico };
  };

  const statusSummary = getStatusSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-shark-dark-bg">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <SharkLogo className="h-16 w-auto mx-auto animate-pulse" />
            <div className="flex items-center space-x-2 text-shark-dark dark:text-white">
              <Loader2 className="h-5 w-5 animate-spin text-shark-primary" />
              <span className="font-inter font-medium">Carregando grupos...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-shark-dark-bg">
      <GroupsHeader 
        statusSummary={statusSummary}
        loading={refreshing}
        onRefresh={handleRefresh}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {error ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-shark-dark-card rounded-lg border-2 border-shark-primary p-8 max-w-md mx-auto shadow-sm">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-poppins font-semibold text-shark-dark dark:text-white mb-2">
                Erro ao carregar dados
              </h3>
              <p className="text-shark-gray dark:text-gray-300 font-inter mb-4">{error}</p>
              <Button
                onClick={handleRefresh}
                className="bg-shark-primary hover:bg-shark-primary/90 text-white font-inter font-medium"
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-shark-dark-card rounded-lg border-2 border-gray-200 dark:border-gray-600 p-8 max-w-md mx-auto shadow-sm">
              <SharkLogo className="h-16 w-auto mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-poppins font-semibold text-shark-dark dark:text-white mb-2">
                Nenhum grupo encontrado
              </h3>
              <p className="text-shark-gray dark:text-gray-300 font-inter">
                Não há grupos cadastrados no momento.
              </p>
            </div>
          </div>
        ) : (
          <>
            <GroupsSearch
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              managementFilters={managementFilters}
              onSearchChange={setSearchTerm}
              onStatusFilterChange={setStatusFilter}
              onManagementFiltersChange={setManagementFilters}
              totalGroups={filteredGroups.length}
            />

            <GroupsStatusSummary 
              statusSummary={statusSummary} 
              activeFilter={statusFilter}
              onFilterChange={setStatusFilter}
            />

            {filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white dark:bg-shark-dark-card rounded-lg border-2 border-gray-200 dark:border-gray-600 p-8 max-w-md mx-auto shadow-sm">
                  <Search className="h-16 w-16 mx-auto mb-4 text-shark-gray dark:text-gray-400" />
                  <h3 className="text-xl font-poppins font-semibold text-shark-dark dark:text-white mb-2">
                    Nenhum grupo encontrado
                  </h3>
                  <p className="text-shark-gray dark:text-gray-300 font-inter">
                    Tente ajustar os termos de busca ou limpar o filtro.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Groups Table */}
                <Card className="bg-white dark:bg-shark-dark-card border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                  <CardHeader className="border-b-2 border-shark-primary">
                    <CardTitle className="text-shark-dark dark:text-white font-poppins">
                      Lista de Grupos
                      {(searchTerm || managementFilters.squad || managementFilters.head || managementFilters.gestor) && (
                        <span className="text-sm font-normal text-shark-gray dark:text-gray-300 ml-2 font-inter">
                          - Filtros: 
                          {searchTerm && ` Nome: "${searchTerm}"`}
                          {managementFilters.squad && ` Squad: "${managementFilters.squad}"`}
                          {managementFilters.head && ` Head: "${managementFilters.head}"`}
                          {managementFilters.gestor && ` Gestor: "${managementFilters.gestor}"`}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GroupsTable 
              groups={currentGroups} 
              onUpdateGroup={updateGroupField}
              onClearStatus={clearGroupStatus}
            />
                    <GroupsPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      startIndex={startIndex}
                      endIndex={endIndex}
                      totalItems={filteredGroups.length}
                      onPageChange={setCurrentPage}
                    />
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GroupsPanel;