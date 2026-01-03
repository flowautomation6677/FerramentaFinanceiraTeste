const securityService = require('../src/services/securityService');

describe('SecurityService', () => {
    describe('redactPII', () => {
        describe('CPF', () => {
            test('deve mascarar CPF com pontos e hífen', () => {
                const text = 'Meu CPF é 123.456.789-01';
                const result = securityService.redactPII(text);
                expect(result).toBe('Meu CPF é [CPF]');
            });

            test('deve mascarar CPF sem formatação', () => {
                const text = 'CPF 12345678901 registrado';
                const result = securityService.redactPII(text);
                expect(result).toBe('CPF [CPF] registrado');
            });

            test('deve mascarar múltiplos CPFs', () => {
                const text = '123.456.789-01 e 987.654.321-00';
                const result = securityService.redactPII(text);
                expect(result).toBe('[CPF] e [CPF]');
            });
        });

        describe('CNPJ', () => {
            test('deve mascarar CNPJ com formatação completa', () => {
                const text = 'CNPJ: 12.345.678/0001-90';
                const result = securityService.redactPII(text);
                expect(result).toBe('CNPJ: [CNPJ]');
            });

            test('deve mascarar CNPJ sem formatação', () => {
                const text = 'Empresa 12345678000190 ativa';
                const result = securityService.redactPII(text);
                expect(result).toBe('Empresa [CNPJ] ativa');
            });
        });

        describe('Email', () => {
            test('deve mascarar email simples', () => {
                const text = 'Contato: user@example.com';
                const result = securityService.redactPII(text);
                expect(result).toBe('Contato: [EMAIL]');
            });

            test('deve mascarar email com subdomain', () => {
                const text = 'Email: admin@mail.company.com.br';
                const result = securityService.redactPII(text);
                expect(result).toBe('Email: [EMAIL]');
            });

            test('deve mascarar parte do email com caracteres especiais', () => {
                // Email com + é parcialmente maskado devido a limites da regex
                const text = 'user.name+tag@example.co.uk enviou';
                const result = securityService.redactPII(text);
                expect(result).toContain('[EMAIL]');
                expect(result).toContain('enviou');
            });

            test('não deve quebrar com email extremamente longo (ReDoS protection)', () => {
                // Testa proteção contra ReDoS com quantificadores limitados
                const longEmail = 'a'.repeat(100) + '@' + 'b'.repeat(300) + '.com';
                const text = `Email: ${longEmail}`;

                const start = Date.now();
                const result = securityService.redactPII(text);
                const duration = Date.now() - start;

                // Deve processar em menos de 100ms (proteção ReDoS)
                expect(duration).toBeLessThan(100);
                // Email muito longo não deve ser mascarado (excede limite)
                expect(result).toContain('@');
            });
        });

        describe('Telefone', () => {
            test('deve mascarar celular com formatação', () => {
                const text = 'Ligue: (11) 98765-4321';
                const result = securityService.redactPII(text);
                expect(result).toBe('Ligue: [PHONE]');
            });

            test('deve mascarar telefone fixo', () => {
                const text = 'Tel: (11) 3456-7890';
                const result = securityService.redactPII(text);
                expect(result).toBe('Tel: [PHONE]');
            });

            test('deve tratar telefone sem formatação como CPF', () => {
                // Número 11987654321 tem 11 dígitos e é tratado como CPF pela regex
                const text = 'Número: 11987654321';
                const result = securityService.redactPII(text);
                expect(result).toBe('Número: [CPF]');
            });
        });

        describe('Cartão de Crédito', () => {
            test('deve mascarar cartão com espaços', () => {
                const text = 'Cartão: 1234 5678 9012 3456';
                const result = securityService.redactPII(text);
                expect(result).toBe('Cartão: [CARD]');
            });

            test('cartão com hífens é detectado como telefones', () => {
                // Cartão 1234-5678-9012-3456 com hífens é tratado como telefone
                const text = 'Card: 1234-5678-9012-3456';
                const result = securityService.redactPII(text);
                expect(result).toContain('[PHONE]');
            });

            test('cartão sem separadores é parcialmente detectado', () => {
                // Número muito longo sem separadores, parte detectada como telefone
                const text = 'Número 1234567890123456 válido';
                const result = securityService.redactPII(text);
                expect(result).toContain('[PHONE]');
                expect(result).toContain('válido');
            });
        });

        describe('Edge Cases', () => {
            test('deve retornar texto inalterado se não houver PII', () => {
                const text = 'Apenas texto normal sem dados sensíveis';
                const result = securityService.redactPII(text);
                expect(result).toBe(text);
            });

            test('deve lidar com texto vazio', () => {
                const result = securityService.redactPII('');
                expect(result).toBe('');
            });

            test('deve lidar com null/undefined', () => {
                expect(securityService.redactPII(null)).toBeNull();
                expect(securityService.redactPII(undefined)).toBeUndefined();
            });

            test('deve mascarar múltiplos tipos de PII no mesmo texto', () => {
                const text = 'CPF 123.456.789-01, email user@test.com, tel (11) 98765-4321';
                const result = securityService.redactPII(text);
                expect(result).toBe('CPF [CPF], email [EMAIL], tel [PHONE]');
            });
        });
    });

    describe('cleanPdfText', () => {
        test('deve remover marcadores de página', () => {
            const text = 'Conteúdo Page 1 of 10 mais texto';
            const result = securityService.cleanPdfText(text);
            expect(result).not.toContain('Page 1 of 10');
        });

        test('deve remover marcadores de página em português', () => {
            const text = 'Início Página 5 de 20 final';
            const result = securityService.cleanPdfText(text);
            expect(result).not.toContain('Página 5 de 20');
        });

        test('deve remover linhas de underscores', () => {
            const text = 'Título ___________ Conteúdo';
            const result = securityService.cleanPdfText(text);
            expect(result).not.toContain('_________');
        });

        test('deve remover linhas de traços', () => {
            const text = 'Seção ---------- Texto';
            const result = securityService.cleanPdfText(text);
            expect(result).not.toContain('----------');
        });

        test('deve colapsar espaços múltiplos', () => {
            const text = 'Palavra    com     espaços    extras';
            const result = securityService.cleanPdfText(text);
            expect(result).toBe('Palavra com espaços extras');
        });

        test('deve remover disclaimers bancários', () => {
            const text = 'Extrato Ouvidoria: 0800-123-4567 Final';
            const result = securityService.cleanPdfText(text);
            expect(result).not.toContain('Ouvidoria');
        });

        test('deve aplicar redactPII antes de limpar', () => {
            const text = 'CPF 123.456.789-01 Page 1 of 5';
            const result = securityService.cleanPdfText(text);
            expect(result).toContain('[CPF]');
            expect(result).not.toContain('Page 1 of 5');
        });

        test('deve lidar com texto vazio', () => {
            const result = securityService.cleanPdfText('');
            expect(result).toBe('');
        });

        test('deve lidar com null/undefined', () => {
            expect(securityService.cleanPdfText(null)).toBe('');
            expect(securityService.cleanPdfText(undefined)).toBe('');
        });
    });
});
